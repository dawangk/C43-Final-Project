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
}