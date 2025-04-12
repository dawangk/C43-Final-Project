import {spawn} from 'child_process';
import {Parser} from 'json2csv';
import path from 'path';
import {Readable} from 'stream';

import db from '../db/connectDb';
import {ResponseType} from '../models/response';
import {getPeriod} from '../utils/getPeriod';

export class StockService {
  async getStocks(search: string): Promise<ResponseType> {
    try {
      const result = await db.query(
          'SELECT * FROM Stock WHERE symbol ILIKE $1', [`%${search}%`]);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  // Get latest information on a given stock
  async getStock(symbol: string, port_id: number): Promise<ResponseType> {
    try {
      if (port_id) {
        const result = await db.query(
            `
          WITH CombinedStockPerformance AS (
            SELECT DISTINCT ON (symbol, timestamp) *
            FROM (
              SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = $2 AND 
              WHERE symbol = $1
              UNION ALL
              SELECT * FROM HistoricalStockPerformance WHERE symbol = $1
            ) combined
            ORDER BY symbol, timestamp DESC NULLS LAST
          )
          SELECT symbol, timestamp, open, high, low, close, volume,
                ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS performance_day
          FROM CombinedStockPerformance
          ORDER BY timestamp DESC
          LIMIT 1`,
            [symbol, port_id]);
        return {
          data: {
            ...result.rows[0],
            performance_day: parseFloat(result.rows[0].performance_day),
          },
        };
      } else {
        const result = await db.query(

            // -- this first one doesn't use index of (symbol, timestamp DESC)
            // so it forces sequential scan

            // `SELECT symbol, timestamp, open, high, low, close, volume,
            // ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS
            // performance_day FROM HistoricalStockPerformance WHERE symbol = $1
            // AND timestamp >= ALL(
            //   SELECT timestamp FROM HistoricalStockPerformance WHERE symbol =
            //   $1
            // )`,

            // -- this one uses index
            `SELECT symbol, timestamp, open, high, low, close, volume,
                ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS performance_day
          FROM HistoricalStockPerformance
          WHERE symbol = $1
          ORDER BY timestamp DESC
          LIMIT 1`,
            [symbol]);
        return {
          data: {
            ...result.rows[0],
            performance_day: parseFloat(result.rows[0].performance_day),
          },
        };
      }

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }


  // Get historical information on a given stock for a given time period (week,
  // month, quarter, year, 5 years)
  async getStockHistory(symbol: string, period: string, port_id?: number):
      Promise<ResponseType> {
    try {
      let interval: string = getPeriod(period);
      console.log(interval)
      console.log('Port: ', port_id)
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
            [symbol, interval]);
      } else {
        result = await db.query(
            `
            WITH latest_date AS (
                  SELECT timestamp 
                  FROM HistoricalStockPerformance 
                  WHERE symbol = $1
                  ORDER BY timestamp DESC 
                  LIMIT 1
            ),
          CombinedStockPerformance AS (
            SELECT DISTINCT ON (symbol, timestamp) *
            FROM (
              SELECT 
                rsp.symbol, 
                rsp.timestamp, 
                rsp.open, 
                rsp.high, 
                rsp.low, 
                rsp.close, 
                rsp.volume,
                1 as priority 
              FROM RecordedStockPerformance rsp
              JOIN StockOwned so ON rsp.symbol = so.symbol
              WHERE rsp.port_id = $3 AND so.symbol = $1
              
              UNION ALL
              
              SELECT 
                hsp.symbol, 
                hsp.timestamp, 
                hsp.open, 
                hsp.high, 
                hsp.low, 
                hsp.close, 
                hsp.volume,
                2 as priority  
              FROM HistoricalStockPerformance hsp
              JOIN StockOwned so ON hsp.symbol = so.symbol
              WHERE so.symbol = $1
            ) combined
            ORDER BY symbol, timestamp DESC NULLS LAST, priority
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
            [symbol, interval, port_id]);
      }
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getStockPrediction(symbol: string, period: string, port_id?: number):
      Promise<ResponseType> {
    try {
      if (period === 'clear') {
        return {
          data: []
        }
      }
      const interval = getPeriod(period);

      // try to get prediction from cache
      let cacheResult;
      if (!port_id) {
        cacheResult = await db.query(
            `SELECT prediction FROM stock_predictions_cache WHERE symbol = $1 AND interval = $2 AND port_id IS NULL`,
            [symbol, interval]);
      } else {
        cacheResult = await db.query(
            `SELECT prediction FROM stock_predictions_cache WHERE symbol = $1 AND interval = $2 AND port_id = $3`,
            [symbol, interval, port_id]);
      }

      if (cacheResult.rows.length > 0) {
        return {data: cacheResult.rows[0].prediction};
      }

      let result;
      // Get stock info to predict with
      if (!port_id) {
        result = await db.query(
            `SELECT timestamp, close FROM HistoricalStockPerformance WHERE symbol = $1 ORDER BY timestamp`,
            [symbol]);
      } else {
        result = await db.query(
            `
            WITH latest_date AS (
                  SELECT timestamp 
                  FROM HistoricalStockPerformance 
                  WHERE symbol = $1
                  ORDER BY timestamp DESC 
                  LIMIT 1
            ),
            CombinedStockPerformance AS (
            SELECT DISTINCT ON (symbol, timestamp) *
            FROM (
              SELECT 
                rsp.symbol, 
                rsp.timestamp, 
                rsp.open, 
                rsp.high, 
                rsp.low, 
                rsp.close, 
                rsp.volume,
                1 as priority 
              FROM RecordedStockPerformance rsp
              JOIN StockOwned so ON rsp.symbol = so.symbol
              WHERE rsp.port_id = $2 AND so.symbol = $1
              
              UNION ALL
              
              SELECT 
                hsp.symbol, 
                hsp.timestamp, 
                hsp.open, 
                hsp.high, 
                hsp.low, 
                hsp.close, 
                hsp.volume,
                2 as priority  
              FROM HistoricalStockPerformance hsp
              JOIN StockOwned so ON hsp.symbol = so.symbol
              WHERE so.symbol = $1
            ) combined
            ORDER BY symbol, timestamp DESC NULLS LAST, priority
          )
            SELECT timestamp, close FROM CombinedStockPerformance 
            ORDER BY timestamp
          `,
            [symbol, port_id]);
      }

      const rows = result.rows;
      if (!rows.length) {
        return {
          error: {status: 404, message: 'No historical data found for symbol'}
        };
      }

      const parser = new Parser({fields: ['timestamp', 'close']});
      const csv = parser.parse(rows);
      const csvStream = Readable.from([csv]);
      const pyProcess = spawn('python3', ['./src/python/predict.py', interval])

      const timeout = setTimeout(() => {
        pyProcess.kill('SIGKILL');
        console.error('Prediction timed out');
      }, 20000);  // 20s timeout

      pyProcess.on('close', code => {
        clearTimeout(timeout);
      });

      csvStream.pipe(pyProcess.stdin);
      csvStream.on('end', () => {
        pyProcess.stdin.end();  // Important to signal end of input
      });

      let data = '';
      let errorOutput = '';

      pyProcess.stdout.on('data', chunk => (data += chunk.toString()));
      pyProcess.stderr.on('data', err => (errorOutput += err.toString()));

      const predictionData: any = await new Promise((resolve, reject) => {
        pyProcess.on('close', code => {
          if (code !== 0)
            return reject(new Error(`Python error: ${errorOutput}`));
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse Python output'));
          }
        });
      });

      const finalData =
          predictionData.map((p: any) => ({
                               timestamp: new Date(p.ds).toISOString(),
                               price: p.yhat,
                               price_lower: p.yhat_lower,
                               price_upper: p.yhat_upper,
                             }));
      //  Insert into cache
      if (!port_id) {
        await db.query(
            `INSERT INTO stock_predictions_cache (symbol, interval, prediction)
          VALUES ($1, $2, $3)
          ON CONFLICT (symbol, interval, port_id) DO UPDATE
          SET prediction = EXCLUDED.prediction, created_at = CURRENT_TIMESTAMP`,
            [symbol, interval, JSON.stringify(finalData)]);
      } else {
        await db.query(
            `INSERT INTO stock_predictions_cache (symbol, interval, port_id, prediction)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (symbol, interval, port_id) DO UPDATE
          SET prediction = EXCLUDED.prediction, created_at = CURRENT_TIMESTAMP`,
            [symbol, interval, port_id, JSON.stringify(finalData)]);
      }



      return {data: finalData};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}