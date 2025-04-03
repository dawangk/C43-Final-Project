import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import db from '../db/connectDb';
import {ResponseType} from '../models/response';

export class StockListService {
  async createStockList(user_id: number, name: string): Promise<ResponseType> {
    try {
      if (!user_id || !name) {
        return {error: {status: 400, message: 'Name is required.'}};
      }

      const result = await db.query(
          'INSERT INTO StockList (user_id, name) VALUES ($1, $2) RETURNING sl_id',
          [user_id, name]);
      const sl_id = result.rows[0].sl_id;

      return {
        data: {message: 'Stock List created successfully', user_id, sl_id, name}
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getStockListById(user_id: number, sl_id: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'SELECT * FROM StockList WHERE sl_id = $1 AND user_id = $2',
          [sl_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'stockList not found'}};
      }
      const stocks = await db.query(
          `SELECT * 
        FROM Stock
        WHERE sl_id = $1`,
          [sl_id]);

      return {
        data: {info: result.rows[0], count: stocks.rowCount, list: stocks.rows}
      };

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getStockLists(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'SELECT * FROM StockList WHERE user_id = $1', [user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no stockLists found for user'}};
      }
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async updateStockList(user_id: number, sl_id: number, name: string):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id || !name) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'UPDATE StockList SET name = $1 WHERE sl_id = $2 AND user_id = $3 RETURNING sl_id, name',
          [name, sl_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no stockLists found for user'}};
      }

      return {data: {message: 'Update successful!', content: result.rows[0]}};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }


  /**
   * Inserts {symbol, amount} into stockList with sl_id, if it exists, simply
   * overrides the value
   */
  async updateStockEntry(
      user_id: number, sl_id: number, symbol: string,
      amount: number): Promise<ResponseType> {
    try {
      if (!user_id || !sl_id || !symbol || !amount) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const {data, error} = await this.getStockListById(user_id, sl_id);

      if (error) {
        return {
          error: {status: 404, message: 'stockList not found'}
        }
      }

      const result = await db.query(
          `INSERT INTO Stock (sl_id, symbol, amount) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (sl_id, symbol) 
          DO UPDATE SET amount = EXCLUDED.amount 
          RETURNING sl_id, symbol, amount`,
          [sl_id, symbol, amount]);

      return {
        data: {message: 'Insert/Update success!', content: result.rows[0]}
      };

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async deleteStockEntry(user_id: number, sl_id: number, symbol: string):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id || !symbol) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const {data, error} = await this.getStockListById(user_id, sl_id);

      if (error) {
        return {
          error: {status: 404, message: 'stockList not found'}
        }
      }

      const result = await db.query(
          `DELETE FROM Stock WHERE sl_id = $1 AND symbol = $2 RETURNING sl_id, symbol`,
          [sl_id, symbol]);

      if (result.rowCount == 0) {
        return {
          error: {
            status: 404,
            message:
                'symbol ' + symbol + ' not found for stockList of id ' + sl_id
          }
        };
      }
      return {data: {message: 'Delete successful!', content: result.rows[0]}};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async deleteStockList(user_id: number, sl_id: number): Promise<ResponseType> {
    try {
      if (!user_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'DELETE FROM StockList WHERE sl_id = $1 AND user_id = $2 RETURNING name',
          [sl_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no stockLists found for user'}};
      }
      return {data: {message: 'Delete successful!', content: result.rows[0]}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
