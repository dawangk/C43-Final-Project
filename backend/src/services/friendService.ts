

import db from '../db/connectDb';
import {ResponseType} from '../models/response';



export class FriendService {
  async sendFriendRequest(from: number, to: number): Promise<ResponseType> {
    try {
      if (!from || !to) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      if (from == to) {
        return {
          error: {
            status: 400,
            message: 'Cannot send friend request to the same user'
          }
        };
      }
      let result = await db.query(
          `SELECT * FROM FriendRequest WHERE incoming_id = $1 AND to_id = $2`,
          [to, from]);

      if (result.rowCount != 0) {
        return {
          error: {
            status: 400,
            message: 'This user has an outgoing friend request to you'
          }
        };
      }

      result = await db.query(
          `SELECT * FROM Friendship WHERE user1_id = $1 AND user2_id = $2`,
          [Math.min(to, from), Math.max(from, to)]);
      if (result.rowCount != 0) {
        return {
          error:
              {status: 400, message: 'You are already friends with this user'}
        };
      }

      result = await db.query(
          `INSERT INTO 
                FriendRequest (incoming_id, to_id) 
                VALUES ($1, $2)
                RETURNING incoming_id, to_id`,
          [from, to]);

      return {data: {result: result.rows[0]}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async acceptFriendRequest(from: number, to: number): Promise<ResponseType> {
    try {
      if (!from || !to) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let result = await db.query(
          `SELECT * FROM FriendRequest WHERE incoming_id = $1 AND to_id = $2`,
          [from, to]);
      let status = result.rows[0].status;
      if (status != 'pending') {
        return {
          error: {
            status: 400,
            message: 'This friend request is either accepted or rejected'
          }
        }
      }

      result = await db.query(
          `UPDATE FriendRequest SET status = 'accepted' where incoming_id = $1 AND to_id = $2`,
          [from, to]);
      result = await db.query(
          `INSERT INTO Friendship (user1_id, user2_id) VALUES ($1, $2) RETURNING user1_id, user2_id`,
          [Math.min(from, to), Math.max(from, to)]);
      return {data: {result: result.rows[0]}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
