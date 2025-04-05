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
        `SELECT symbol, timestamp, open, high, low, close, volume, ROUND((((close - open) / open) * 100)::NUMERIC, 2) AS change_day
        FROM HistoricalStockPerformance WHERE symbol = $1
        AND timestamp >= ALL(
          SELECT timestamp FROM HistoricalStockPerformance WHERE symbol = $1
        )`, 
        [symbol]
      );
      return {
        data: {
          ...result.rows[0],
          change_day: parseFloat(result.rows[0].change_day),
        },
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}