

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

  async updateFriendRequest(from: number, to: number, status: string):
      Promise<ResponseType> {
    try {
      if (!from || !to || !status) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      if (status != 'accepted' && status != 'rejected') {
        return {error: {status: 400, message: 'Invalid status.'}};
      }
      let result = await db.query(
          `SELECT * FROM FriendRequest WHERE incoming_id = $1 AND to_id = $2`,
          [from, to]);
      let cur_status = result.rows[0].status;
      if (cur_status != 'pending') {
        return {
          error: {
            status: 400,
            message:
                'This friend request is either already accepted or rejected'
          }
        }
      }

      result = await db.query(
          `UPDATE FriendRequest SET status = $3 where incoming_id = $1 AND to_id = $2`,
          [from, to, status]);
      let message = '';
      if (status == 'accepted') {
        result = await db.query(
            `INSERT INTO Friendship (user1_id, user2_id) VALUES ($1, $2) RETURNING user1_id, user2_id`,
            [Math.min(from, to), Math.max(from, to)]);
        message = 'Friendship Accepted';
      } else {
        message = 'Friendship Rejected';
      }
      return {data: {message, result: result.rows[0]}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }


  async getFriends(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let result = await db.query(
          `
        SELECT user_id, username, email
        FROM Users 
        JOIN
        ((SELECT user1_id as userI FROM Friendship WHERE user2_id = $1)
        UNION
        (SELECT user2_id as userI FROM Friendship WHERE user1_id = $1)) AS friend_id
        ON Users.user_id = friend_id.userI
        `,
          [user_id]);
      return {data: {result: result.rows}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getOutgoingFriendRequests(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let result = await db.query(
          `
        WITH outgoing_id as (
          SELECT to_id, status 
          FROM FriendRequest
          WHERE incoming_id = $1 AND status != 'accepted'
        )
        SELECT user_id, username, email, status
        FROM Users JOIN outgoing_id on Users.user_id = outgoing_id.to_id
        `,
          [user_id]);
      return {data: {result: result.rows}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getIncomingFriendRequests(user_id: number): Promise<ResponseType> {
    try {
      if (!user_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      let result = await db.query(
          `
        WITH incoming as (
          SELECT incoming_id, status 
          FROM FriendRequest
          WHERE to_id = $1 AND status = 'pending'
        )
        SELECT user_id, username, email, status
        FROM Users JOIN incoming on Users.user_id = incoming.incoming_id
        `,
          [user_id]);
      return {data: {result: result.rows}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
