import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import db from '../db/connectDb';
import {ResponseType} from '../models/response';

import {StockListService} from './stockListService';

const stockListService = new StockListService();

function isMoneyNumberString(value: number): boolean {
  return /^-?\d+(\.\d{1,2})?$/.test(value.toString());
}


export class PortfolioService {
  async createPortfolio(user_id: number, name: string): Promise<ResponseType> {
    try {
      if (!user_id || !name) {
        return {error: {status: 400, message: 'Name is required.'}};
      }
      const dup = await db.query(
          'SELECT * FROM Portfolio WHERE user_id = $1 AND name = $2',
          [user_id, name]);
      if (dup.rowCount != 0) {
        return {
          error: {status: 400, message: 'Portfolio title already exists'}
        };
      }


      let {data, error} = await stockListService.createStockList(user_id, name);
      if (error) {
        return {error};
      }
      const result = await db.query(
          'INSERT INTO Portfolio (user_id, name, sl_id) VALUES ($1, $2, $3) RETURNING port_id',
          [user_id, name, data.sl_id]);
      const port_id = result.rows[0].port_id;

      return {
        data:
            {message: 'Portfolio created successfully', user_id, port_id, data}
      }

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async modifyFunds(user_id: number, port_id: number, amount: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !port_id || !amount) {
        return {error: {status: 400, message: 'Missing/Invalid parameters.'}};
      }
      if (!isMoneyNumberString(amount)) {
        return {error: {status: 400, message: 'Bad amount format.'}};
      }

      const result = await db.query(
          'SELECT cash_account FROM Portfolio WHERE user_id = $1 AND port_id = $2',
          [user_id, port_id]);

      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'Portfolio not found'}};
      }
      let cashNum =
          parseFloat(result.rows[0].cash_account.replace(/[$,]/g, ''));
      let new_amount = amount + cashNum;
      if (new_amount < 0) {
        return {error: {status: 400, message: 'Negative Balance Detected'}};
      }

      const insert_result = await db.query(
          `UPDATE Portfolio SET cash_account = $1 RETURNING port_id, cash_account`,
          [new_amount]);

      return {
        data: {message: 'Update successs!', result: insert_result.rows[0]}
      }
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getPortfolioById(user_id: number, port_id: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !port_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'SELECT * FROM Portfolio WHERE port_id = $1 AND user_id = $2',
          [port_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'Portfolio not found'}};
      }
      console.log(result.rows[0].sl_id);

      const stockList = await stockListService.getStockListById(
          user_id, result.rows[0].sl_id);

      return {data: {info: result.rows[0], stock_list: stockList}};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getPortfolios(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'SELECT * FROM Portfolio WHERE user_id = $1', [user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no portfolios found for user'}};
      }
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async updatePortfolio(user_id: number, port_id: number, name: string):
      Promise<ResponseType> {
    try {
      if (!user_id || !port_id || !name) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'UPDATE Portfolio SET name = $1 WHERE port_id = $2 AND user_id = $3 RETURNING port_id, name',
          [name, port_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no portfolio found for user'}};
      }

      return {data: {message: 'Update successful!', content: result.rows[0]}};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async deletePortfolio(user_id: number, port_id: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !port_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'DELETE FROM Portfolio WHERE port_id = $1 AND user_id = $2 RETURNING sl_id',
          [port_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no portfolio found for user'}};
      }
      const {data, error} =
          await stockListService.deleteStockList(user_id, result.rows[0].sl_id);
      if (error) {
        return {error};
      }
      return {
        data: {message: 'Delete successful!', content: result.rows[0], data}
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
