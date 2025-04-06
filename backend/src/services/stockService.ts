import db from "../db/connectDb";
import {ResponseType} from '../models/response';

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
}