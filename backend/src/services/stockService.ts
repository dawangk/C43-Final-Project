import db from "../db/connectDb";
import {ResponseType} from '../models/response';
import { getPeriod } from "../utils/getPeriod";
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { Parser } from 'json2csv';
import path from 'path';

export class StockService {
  async getStocks(search: string): Promise<ResponseType> {
    try {
      const result = await db.query(
        "SELECT * FROM Stock WHERE symbol ILIKE $1", [`%${search}%`]
      );
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  // Get latest information on a given stock
  async getStock(symbol: string): Promise<ResponseType> {
    try {
      const result = await db.query(

        // -- this first one doesn't use index of (symbol, timestamp DESC) so it forces sequential scan

        // `SELECT symbol, timestamp, open, high, low, close, volume, ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS performance_day
        // FROM HistoricalStockPerformance WHERE symbol = $1
        // AND timestamp >= ALL(
        //   SELECT timestamp FROM HistoricalStockPerformance WHERE symbol = $1
        // )`, 

        // -- this one uses index
        `SELECT symbol, timestamp, open, high, low, close, volume,
                ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS performance_day
          FROM HistoricalStockPerformance
          WHERE symbol = $1
          ORDER BY timestamp DESC
          LIMIT 1`,
        [symbol]
      );
      return {
        data: {
          ...result.rows[0],
          performance_day: parseFloat(result.rows[0].performance_day),
        },
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  
  // Get historical information on a given stock for a given time period (week, month, quarter, year, 5 years)
  async getStockHistory(symbol: string, period: string, port_id?: number): Promise<ResponseType> {
    try {
      
      let interval: string = getPeriod(period);
      console.log(interval)
      console.log("Port: ", port_id)
      let result;
      if (!port_id) {
        result = await db.query(
          `
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = $1
              AND timestamp >= (
                  SELECT timestamp 
                  FROM HistoricalStockPerformance 
                  WHERE symbol = $1
                  ORDER BY timestamp DESC 
                  LIMIT 1
                ) - CAST($2 AS INTERVAL)
            ORDER BY timestamp;
          `,
          [symbol, interval]
        );
      } else {
        result = await db.query(
          `
            WITH CombinedStockPerformance AS (
                  (SELECT * FROM HistoricalStockPerformance) 
                    UNION ALL
                  (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = $3)
            )
            SELECT *
            FROM CombinedStockPerformance
            WHERE symbol = $1
              AND timestamp >= (
                  SELECT timestamp 
                  FROM CombinedStockPerformance 
                  WHERE symbol = $1
                  ORDER BY timestamp DESC 
                  LIMIT 1
                ) - CAST($2 AS INTERVAL)
            ORDER BY timestamp;
          `,
          [symbol, interval, port_id]
        );
      }
      return {
        data: result.rows
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getStockPrediction(symbol: string, period: string): Promise<ResponseType> {
    try {
      if (period === "clear") {
        return { data: [] }
      }
      const interval = getPeriod(period);
  
      // try to get prediction from cache
      const cacheResult = await db.query(
        `SELECT prediction FROM stock_predictions_cache WHERE symbol = $1 AND interval = $2`,
        [symbol, interval]
      );
  
      if (cacheResult.rows.length > 0) {
        return { data: cacheResult.rows[0].prediction };
      }
  
      // Get stock info to predict with
      const result = await db.query(
        `SELECT timestamp, close FROM HistoricalStockPerformance WHERE symbol = $1 ORDER BY timestamp`,
        [symbol]
      );
  
      const rows = result.rows;
      if (!rows.length) {
        return { error: { status: 404, message: 'No historical data found for symbol' } };
      }
  
      const parser = new Parser({ fields: ['timestamp', 'close'] });
      const csv = parser.parse(rows);
      const csvStream = Readable.from([csv]);
      const pyProcess = spawn('python3', ['./src/python/predict.py', interval])

      const timeout = setTimeout(() => {
        pyProcess.kill('SIGKILL');
        throw new Error('Prediction script timed out');
      }, 10000); // 10s timeout
      
      pyProcess.on('close', code => {
        clearTimeout(timeout);
      });

      csvStream.pipe(pyProcess.stdin);
      csvStream.on('end', () => {
        pyProcess.stdin.end(); // Important to signal end of input
      });

      let data = '';
      let errorOutput = '';
  
      pyProcess.stdout.on('data', chunk => (data += chunk.toString()));
      pyProcess.stderr.on('data', err => (errorOutput += err.toString()));
  
      const predictionData: any = await new Promise((resolve, reject) => {
        pyProcess.on('close', code => {
          if (code !== 0) return reject(new Error(`Python error: ${errorOutput}`));
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse Python output'));
          }
        });
      });

      const finalData = predictionData.map((p: any) => ({
        timestamp: new Date(p.ds).toISOString(),
        price: p.yhat,
        price_lower: p.yhat_lower,
        price_upper: p.yhat_upper,
      }));
      // Step 3: Insert into cache
      await db.query(
        `INSERT INTO stock_predictions_cache (symbol, interval, prediction)
         VALUES ($1, $2, $3)
         ON CONFLICT (symbol, interval) DO UPDATE
         SET prediction = EXCLUDED.prediction, created_at = CURRENT_TIMESTAMP`,
        [symbol, interval, JSON.stringify(finalData)]
      );


  
      return { data: finalData };
  
    } catch (error: any) {
      return {
        error: { status: 500, message: error.message || 'internal server error' }
      };
    }
  }
  

}