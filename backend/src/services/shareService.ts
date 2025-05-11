

import db from '../db/connectDb';
import {ResponseType} from '../models/response';


export class ShareService {
  async shareSLWithFriend(user_id: number, sl_id: number, email_addr: string):
      Promise<ResponseType> {
    try {
      if (!user_id || !sl_id || !email_addr) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let result = await db.query(
          `SELECT user_id from Users where email = $1`, [email_addr]);
      if (result.rowCount == 0) {
        return {error: {status: 400, message: 'Invalid email address'}};
      }
      const friend_id = result.rows[0].user_id;

      const [id1, id2] =
          [Math.min(user_id, friend_id), Math.max(user_id, friend_id)];
      result = await db.query(
          `SELECT * FROM FriendShip WHERE user1_id = $1 AND user2_id = $2
            `,
          [id1, id2]);

      if (result.rowCount == 0) {
        return {
          error: {
            status: 400,
            message: 'You are not friends with this user or invalid user'
          }
        };
      }

      result = await db.query(
          `SELECT * FROM StockList WHERE sl_id = $1 AND user_id = $2
          `,
          [sl_id, user_id]);

      if (result.rowCount == 0) {
        return {error: {status: 400, message: 'Invalid sl_id for user'}};
      }
      const visibility = result.rows[0].visibility;
      if (visibility == 'public') {
        return {error: {status: 400, message: 'StockList is already public'}};
      }

      await db.transaction(async (trx) => {
        await trx.query(
            `UPDATE StockList SET visibility = 'shared' WHERE sl_id = $1`,
            [sl_id]);
        await trx.query(
            `INSERT INTO Share VALUES ($1, $2)`, [sl_id, friend_id]);
      });

      return {data: 'Share success!'};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getUsersShared(user_id: number, sl_id: number): Promise<ResponseType> {
    try {
      if (!user_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let result = await db.query(
          `SELECT * FROM StockList WHERE sl_id = $1 and user_id = $2
          `,
          [sl_id, user_id]);

      if (result.rowCount == 0) {
        return {error: {status: 400, message: 'Invalid sl_id for user'}};
      }

      result = await db.query(
          `SELECT s.user_id, u.username, u.email FROM Share s
           JOIN Users u ON s.user_id = u.user_id
           WHERE s.sl_id = $1 
        `,
          [sl_id]);

      return {data: result.rows};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
