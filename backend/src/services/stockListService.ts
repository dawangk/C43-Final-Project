import db from '../db/connectDb';
import {ResponseType} from '../models/response';
import {getPeriod} from '../utils/getPeriod';

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
        FROM StockOwned
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

  async getStockListByIdWithData(user_id: number, sl_id: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          `
          SELECT * FROM StockList sl 
          LEFT JOIN Share s on s.sl_id = sl.sl_id
          WHERE sl.sl_id = $1 AND (sl.user_id = $2 OR sl.visibility = 'public' OR s.user_id = $2)`,
          [sl_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'stockList not found'}};
      }
      const stocksWithData = await db.query(
          `SELECT 
          so.*, 
          hsp_latest.*, 
          ROUND((((hsp_latest.close - hsp_latest.open) / hsp_latest.open) * 100)::NUMERIC, 2) AS performance_day,
          ROUND((((hsp_latest.close - hsp_past.close) / hsp_past.close) * 100)::NUMERIC, 2) AS performance_ytd
        FROM StockOwned so
        JOIN (
          SELECT DISTINCT ON (symbol) *
          FROM HistoricalStockPerformance
          ORDER BY symbol, timestamp DESC
        ) hsp_latest ON so.symbol = hsp_latest.symbol
        LEFT JOIN LATERAL (
          SELECT *
          FROM HistoricalStockPerformance h
          WHERE h.symbol = so.symbol
            AND h.timestamp <= hsp_latest.timestamp - INTERVAL '1 year'
          ORDER BY h.timestamp DESC
          LIMIT 1
        ) hsp_past ON true
        WHERE so.sl_id = $1`,
          [sl_id]);

      return {
        data: {
          info: result.rows[0],
          count: stocksWithData.rowCount,
          list: stocksWithData.rows
        }
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
          `
          SELECT * FROM StockList WHERE user_id = $1
          `,
          [user_id]);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getStockListsWithData(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          // -- performance of a stock list is calculated for 1d and YTD. Each
          // stock is given equal weight, so we just find AVG performance.
          `
          WITH sl as(
            SELECT * FROM StockList WHERE user_id = $1
          )
          SELECT 
            sl.sl_id, sl.user_id, sl.name, sl.visibility, sl.created_at, 
            ROUND(AVG(((latest.close - latest.open) / latest.open) * 100)::NUMERIC, 2) AS performance_day,
            ROUND(AVG(
              ((latest.close - COALESCE(past.close, latest.close)) / NULLIF(COALESCE(past.close, latest.close), 0)) * 100
            )::NUMERIC, 2) AS performance_ytd
          FROM sl
          LEFT JOIN StockOwned so ON sl.sl_id = so.sl_id
          LEFT JOIN LATERAL (
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = so.symbol
            ORDER BY timestamp DESC
            LIMIT 1
          ) latest ON true
          LEFT JOIN LATERAL (
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = so.symbol
              AND timestamp <= (
                SELECT timestamp 
                FROM HistoricalStockPerformance 
                WHERE symbol = so.symbol 
                ORDER BY timestamp DESC 
                LIMIT 1
              ) - INTERVAL '1 year'
            ORDER BY timestamp DESC
            LIMIT 1
          ) past ON true
          GROUP BY sl.sl_id, sl.user_id, sl.name, sl.visibility, sl.created_at 
          `,
          [user_id]);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getPublicStockLists(): Promise<ResponseType> {
    try {
      const result = await db.query(`
          SELECT * FROM StockList WHERE visibility = 'public'
          `);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getPublicStockListsWithData(): Promise<ResponseType> {
    try {
      const result = await db.query(
          // -- performance of a stock list is calculated for 1d and YTD. Each
          // stock is given equal weight, so we just find AVG performance.
          `
          WITH sl as(
            SELECT StockList.*, Users.username FROM StockList 
            JOIN Users on StockList.user_id = Users.user_id
            WHERE visibility = 'public'
          )
          SELECT 
            sl.sl_id, sl.user_id, sl.name, sl.username, sl.visibility, sl.created_at, 
            ROUND(AVG(((latest.close - latest.open) / latest.open) * 100)::NUMERIC, 2) AS performance_day,
            ROUND(AVG(
              ((latest.close - COALESCE(past.close, latest.close)) / NULLIF(COALESCE(past.close, latest.close), 0)) * 100
            )::NUMERIC, 2) AS performance_ytd
          FROM sl
          LEFT JOIN StockOwned so ON sl.sl_id = so.sl_id
          LEFT JOIN LATERAL (
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = so.symbol
            ORDER BY timestamp DESC
            LIMIT 1
          ) latest ON true
          LEFT JOIN LATERAL (
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = so.symbol
              AND timestamp <= (
                SELECT timestamp 
                FROM HistoricalStockPerformance 
                WHERE symbol = so.symbol 
                ORDER BY timestamp DESC 
                LIMIT 1
              ) - INTERVAL '1 year'
            ORDER BY timestamp DESC
            LIMIT 1
          ) past ON true
          GROUP BY sl.sl_id, sl.user_id, sl.name, sl.username, sl.visibility, sl.created_at 
          `);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getSharedStockLists(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          `
          SELECT StockList.* FROM StockList JOIN Share on StockList.sl_id = Share.sl_id 
          WHERE Share.user_id = $1
          `,
          [user_id]);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getSharedStockListsWithData(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          // -- performance of a stock list is calculated for 1d and YTD. Each
          // stock is given equal weight, so we just find AVG performance.
          `
          WITH sl as(
            SELECT StockList.*, Users.username FROM StockList 
            JOIN Share on StockList.sl_id = Share.sl_id 
            JOIN Users on StockList.user_id = Users.user_id
            WHERE Share.user_id = $1
          )
          SELECT 
            sl.sl_id, sl.user_id, sl.name, sl.username, sl.visibility, sl.created_at, 
            ROUND(AVG(((latest.close - latest.open) / latest.open) * 100)::NUMERIC, 2) AS performance_day,
            ROUND(AVG(
              ((latest.close - COALESCE(past.close, latest.close)) / NULLIF(COALESCE(past.close, latest.close), 0)) * 100
            )::NUMERIC, 2) AS performance_ytd
          FROM sl
          LEFT JOIN StockOwned so ON sl.sl_id = so.sl_id
          LEFT JOIN LATERAL (
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = so.symbol
            ORDER BY timestamp DESC
            LIMIT 1
          ) latest ON true
          LEFT JOIN LATERAL (
            SELECT *
            FROM HistoricalStockPerformance
            WHERE symbol = so.symbol
              AND timestamp <= (
                SELECT timestamp 
                FROM HistoricalStockPerformance 
                WHERE symbol = so.symbol 
                ORDER BY timestamp DESC 
                LIMIT 1
              ) - INTERVAL '1 year'
            ORDER BY timestamp DESC
            LIMIT 1
          ) past ON true
          GROUP BY sl.sl_id, sl.user_id, sl.username, sl.name, sl.visibility, sl.created_at 
          `,
          [user_id]);
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

  async updateStockListVisibility(user_id: number, sl_id: number):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let res_type = 'private';

      const {data, error} = await this.getStockListById(user_id, sl_id);
      if (error) {
        return {error: {status: 400, message: 'Invalid stock list.'}};
      }
      const cur_visibility = data.info.visibility;
      console.log(cur_visibility);
      console.log(data);
      switch (cur_visibility) {
        case 'private':
          res_type = 'public';
          break;
        case 'shared':
          res_type = 'public';
          break;
        case 'public':
          const res = await db.query(
              `SELECT * FROM StockList JOIN Share on StockList.sl_id = Share.sl_id WHERE StockList.user_id = $1 AND StockList.sl_id = $2`,
              [user_id, sl_id]);
          if (res.rowCount == 0) {
            res_type = 'private';
          } else {
            res_type = 'public';
          }
          break;
        default:
          return {error: {status: 500, message: 'This should never happen.'}};
      }

      const result = await db.query(
          'UPDATE StockList SET visibility = $1 WHERE sl_id = $2 AND user_id = $3 RETURNING sl_id, name, visibility',
          [res_type, sl_id, user_id]);

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
      if (!user_id || !sl_id || !symbol || amount < 0) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const {data, error} = await this.getStockListById(user_id, sl_id);

      if (error) {
        return {
          error: {status: 404, message: 'stockList not found'}
        }
      }

      const result = await db.query(
          `INSERT INTO StockOwned (sl_id, symbol, amount) 
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
          `DELETE FROM StockOwned WHERE sl_id = $1 AND symbol = $2 RETURNING sl_id, symbol`,
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


  async getStockListStats(user_id: number, sl_id: number, period: string):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }

      let interval: string = getPeriod(period);

      // coeff of variance and beta
      const result = await db.query(
          `
      WITH stocks_in_list AS (
        SELECT symbol FROM StockOwned so 
        JOIN StockList sl ON so.sl_id = sl.sl_id
        WHERE sl.sl_id = $1
      ),
      latest_date AS (
        SELECT MAX(timestamp) AS max_date FROM HistoricalStockPerformance
      ),
      daily_returns AS (
        SELECT 
          symbol,
          timestamp,
          (close - LAG(close) OVER (PARTITION BY symbol ORDER BY timestamp)) / 
          LAG(close) OVER (PARTITION BY symbol ORDER BY timestamp) AS daily_return
        FROM HistoricalStockPerformance
        WHERE symbol IN (SELECT symbol FROM stocks_in_list)
      ),
      filtered_returns AS (
        SELECT dr.*
        FROM daily_returns dr
        JOIN latest_date ld ON dr.timestamp >= ld.max_date - $2::INTERVAL
      ),
      market_returns AS (
        SELECT 
          timestamp,
          AVG(daily_return) AS market_return
        FROM filtered_returns
        GROUP BY timestamp
      ),
      joined_returns AS (
        SELECT 
          f.symbol,
          f.timestamp,
          f.daily_return,
          m.market_return
        FROM filtered_returns f
        JOIN market_returns m ON f.timestamp = m.timestamp
      ),
      cv_beta AS (
        SELECT
          symbol,
          STDDEV(daily_return) / NULLIF(AVG(daily_return), 0) AS coefficient_of_variance,
          COVAR_POP(daily_return, market_return) / VAR_POP(market_return) AS beta
        FROM joined_returns
        GROUP BY symbol
      )
      SELECT * FROM cv_beta;

      `,
          [sl_id, interval])

      // Covariance/correlation matrix
      // Note: matix is in long-form: pairwise results per row
      // Note 2: Only joins stock pairs with matching timestamps
      const result_matrix = await db.query(
          `
      WITH stocks_in_list AS (
        SELECT symbol FROM StockOwned so 
        JOIN StockList sl ON so.sl_id = sl.sl_id
        WHERE sl.sl_id = $1
      ),
      latest_date AS (
        SELECT MAX(timestamp) AS max_date FROM HistoricalStockPerformance
      ),
      daily_returns AS (
        SELECT 
          symbol,
          timestamp,
          (close - LAG(close) OVER (PARTITION BY symbol ORDER BY timestamp)) / 
          LAG(close) OVER (PARTITION BY symbol ORDER BY timestamp) AS daily_return
        FROM HistoricalStockPerformance
        WHERE symbol IN (SELECT symbol FROM stocks_in_list)
      ),
      filtered_returns AS (
        SELECT dr.*
        FROM daily_returns dr
        JOIN latest_date ld ON dr.timestamp >= ld.max_date - $2::INTERVAL
      ),
      pairwise_returns AS (
        SELECT 
          a.symbol AS stock_a,
          b.symbol AS stock_b,
          a.daily_return AS return_a,
          b.daily_return AS return_b
        FROM filtered_returns a
        JOIN filtered_returns b 
          ON a.timestamp = b.timestamp AND a.symbol < b.symbol
      )
      SELECT 
        stock_a,
        stock_b,
        COVAR_POP(return_a, return_b) AS covariance,
        CORR(return_a, return_b) AS correlation
      FROM pairwise_returns
      GROUP BY stock_a, stock_b
      ORDER BY stock_a, stock_b;

      `,
          [sl_id, interval])

      return {data: {coeff_and_beta: result.rows, matrix: result_matrix.rows}};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
