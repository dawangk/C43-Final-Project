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
            (SELECT * FROM HistoricalStockPerformance) 
              UNION 
            (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = $2)
          )
          SELECT symbol, timestamp, open, high, low, close, volume,
                ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS performance_day
          FROM CombinedStockPerformance
          WHERE symbol = $1
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
  async getStockHistory(symbol: string, period: string, port_id: number):
      Promise<ResponseType> {
    try {
      let interval: string = getPeriod(period);
      console.log(interval)
      if (port_id) {
        const result = await db.query(
            `
          WITH CombinedStockPerformance AS (
            (SELECT * FROM HistoricalStockPerformance) 
              UNION 
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
            [symbol, interval, port_id]);
        return {data: result.rows};
      }
      else {
        const result = await db.query(
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
        return {data: result.rows};
      }
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}