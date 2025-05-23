import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import {parse} from 'csv-parse';
import fs from 'fs';
import jwt from 'jsonwebtoken';

import db from '../db/connectDb';
import {ResponseType} from '../models/response';
import {getPeriod} from '../utils/getPeriod';

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
      let cashNum = parseFloat(result.rows[0].cash_account.replace(/[$,]/g, ''))
      let new_amount = (amount * 100 + cashNum * 100) / 100;
      if (new_amount < 0) {
        return {error: {status: 400, message: 'Negative Balance Detected'}};
      }

      const insert_result = await db.query(
          `UPDATE Portfolio SET cash_account = $1 WHERE user_id = $2 AND port_id = $3 RETURNING port_id, cash_account`,
          [new_amount, user_id, port_id]);

      return {
        data: {message: 'Update successs!', result: insert_result.rows[0]}
      }
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async transferFunds(
      user_id: number, id_1: number, id_2: number,
      amount: number): Promise<ResponseType> {
    try {
      if (!user_id || !id_1 || !id_2 || !amount) {
        return {error: {status: 400, message: 'Missing/Invalid parameters.'}};
      }
      if (!isMoneyNumberString(amount)) {
        return {error: {status: 400, message: 'Bad amount format.'}};
      }

      // Use transaction to atomically update the cash account of both accounts
      await db.query('BEGIN');

      // Check balance
      const res = await db.query(
          `SELECT cash_account FROM Portfolio WHERE port_id = $1 AND user_id = $2`,
          [id_1, user_id]);

      if (res.rows.length === 0) {
        throw new Error(`Sender portfolio ${id_1} does not exist.`);
      }

      const senderBalance =
          parseFloat(res.rows[0].cash_account.replace(/[^0-9.-]+/g, ''));
      if (senderBalance < amount) {
        throw new Error('Insufficient funds.');
      }

      // Subtract from sender
      await db.query(
          `UPDATE Portfolio SET cash_account = cash_account - $1::MONEY WHERE port_id = $2 AND user_id = $3`,
          [amount, id_1, user_id]);

      // Add to receiver
      await db.query(
          `UPDATE Portfolio SET cash_account = cash_account + $1::MONEY WHERE port_id = $2 AND user_id = $3`,
          [amount, id_2, user_id]);

      await db.query('COMMIT');

      return {
        data: {
          message: 'Update successs!',
          result: {message: 'Transaction success'}
        }
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

  async getPortfolioByIdWithData(user_id: number, port_id: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !port_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          `SELECT 
            p.*,
            ROUND(SUM(so.amount * latest.close)::NUMERIC, 2) AS market_value,
            ROUND((
              SUM(so.amount * ((latest.close - latest.open) / latest.open) * 100)::NUMERIC
              / NULLIF(SUM(so.amount), 0)
            ), 2) AS performance_day,
            ROUND((
              SUM(
                so.amount * (
                  (latest.close - COALESCE(past.close, latest.close)) / 
                  NULLIF(COALESCE(past.close, latest.close), 0)
                ) * 100
              )::NUMERIC
              / NULLIF(SUM(so.amount), 0)
            ), 2) AS performance_year
        FROM Portfolio p
        JOIN StockList sl ON p.sl_id = sl.sl_id
        LEFT JOIN StockOwned so ON sl.sl_id = so.sl_id
        LEFT JOIN LATERAL (
          SELECT *
          FROM (
            (SELECT * FROM HistoricalStockPerformance) 
              UNION 
            (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = p.port_id)
          )
          WHERE symbol = so.symbol
          ORDER BY timestamp DESC
          LIMIT 1
        ) latest ON true
        LEFT JOIN LATERAL (
          SELECT *
          FROM (
            (SELECT * FROM HistoricalStockPerformance) 
              UNION 
            (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = p.port_id)
          )
          WHERE symbol = so.symbol
            AND timestamp <= (SELECT timestamp FROM (
              (SELECT * FROM HistoricalStockPerformance) 
                UNION 
              (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = p.port_id)
            ) WHERE symbol = so.symbol ORDER BY timestamp DESC LIMIT 1) - INTERVAL '1 year'
          ORDER BY timestamp DESC
          LIMIT 1
        ) past ON true
        WHERE p.user_id = $2 AND p.port_id = $1
        GROUP BY p.port_id, p.user_id;
        `,
          [port_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'Portfolio not found'}};
      }
      console.log(result.rows[0].sl_id);

      const stockListWithData = await stockListService.getStockListByIdWithData(
          user_id, result.rows[0].sl_id);

      return {data: {info: result.rows[0], stock_list: stockListWithData}};

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
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async uploadPortfolioData(
      user_id: number, port_id: number,
      file: Express.Multer.File): Promise<ResponseType> {
    try {
      if (!user_id || !port_id || !file) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const parser =
          fs.createReadStream(file.path).pipe(parse({columns: true}));
      let cnt = 0;
      for await (const row of parser) {
        if (!row.symbol || !row.timestamp || !row.open || !row.close ||
            !row.high || !row.low || !row.volume)
          continue;
        await db.query(
            `INSERT INTO recordedstockperformance 
            (port_id, symbol, timestamp, open, high, low, close, volume) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (port_id, symbol, timestamp)
            DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low, 
            close = EXCLUDED.close,
            volume = EXCLUDED.volume`,
            [
              port_id, row.symbol, row.timestamp, row.open, row.high, row.low,
              row.close, row.volume
            ]);
        cnt++;
      }
      return {data: {message: 'upload success!', rowCount: cnt}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getPortfoliosWithData(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          // -- performance of a portfolio is calculated for 1d and YTD. Each
          // stock has different amount so we find weight avg perfromance.

          `
          SELECT 
            p.*,
            ROUND(SUM(so.amount * latest.close)::NUMERIC, 2) AS market_value,
            ROUND((
              SUM(so.amount * ((latest.close - latest.open) / latest.open) * 100)::NUMERIC
              / NULLIF(SUM(so.amount), 0)
            ), 2) AS performance_day,
            ROUND((
              SUM(
                so.amount * (
                  (latest.close - COALESCE(past.close, latest.close)) / 
                  NULLIF(COALESCE(past.close, latest.close), 0)
                ) * 100
              )::NUMERIC
              / NULLIF(SUM(so.amount), 0)
            ), 2) AS performance_year
          FROM Portfolio p
          JOIN StockList sl ON p.sl_id = sl.sl_id
          LEFT JOIN StockOwned so ON sl.sl_id = so.sl_id
          LEFT JOIN LATERAL (
            SELECT *
            FROM (
            (SELECT * FROM HistoricalStockPerformance) 
            UNION 
            (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = p.port_id))
            WHERE symbol = so.symbol
            ORDER BY timestamp DESC
            LIMIT 1
          ) latest ON true
          LEFT JOIN LATERAL (
            SELECT *
            FROM (
              (SELECT * FROM HistoricalStockPerformance) 
              UNION 
              (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = p.port_id)
            )
            WHERE symbol = so.symbol
              AND timestamp <= (
                SELECT timestamp 
                FROM (
                  (SELECT * FROM HistoricalStockPerformance) 
                  UNION 
                  (SELECT symbol, timestamp, open, high, low, close, volume FROM RecordedStockPerformance WHERE port_id = p.port_id)
                ) 
                WHERE symbol = so.symbol 
                ORDER BY timestamp DESC 
                LIMIT 1
              ) - INTERVAL '1 year'
            ORDER BY timestamp DESC
            LIMIT 1
          ) past ON true
          WHERE p.user_id = $1
          GROUP BY p.port_id, p.user_id;
          `,
          [user_id]);
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

  async getPortfolioStats(user_id: number, port_id: number, period: string):
      Promise<ResponseType> {
    try {
      if (!user_id || !port_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          `SELECT sl_id FROM Portfolio WHERE user_id = $1 AND port_id = $2`,
          [user_id, port_id]);

      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no portfolio found for user'}};
      }

      const sl_id = result.rows[0].sl_id;
      return await stockListService.getStockListStats(user_id, sl_id, period);

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
