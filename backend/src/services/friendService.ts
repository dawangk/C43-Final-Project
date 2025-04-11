

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
      const [id1, id2] = [Math.min(to, from), Math.max(from, to)];
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
          `SELECT * FROM FriendRequest WHERE incoming_id = $1 AND to_id = $2 AND status = 'rejected'`,
          [from, to]);

      if (result.rowCount != 0) {
        const updatedAt = new Date(result.rows[0].updated_at);
        const fiveMinutesLater =
            new Date(updatedAt.getTime() + 5 * 60 * 1000);  // 5 minutes in ms
        const now = new Date();

        if (fiveMinutesLater <= now) {
          result = await db.query(
              `UPDATE FriendRequest SET status = 'pending', updated_at = now() where incoming_id = $1 AND to_id = $2`,
              [from, to]);

          return {data: {result: result.rows[0]}};
        } else {
          const remainingMs = fiveMinutesLater.getTime() - now.getTime();
          const remainingSeconds =
              Math.ceil(remainingMs / 1000);  // Optional: floor or ceil
          return {
            error: {
              status: 403,
              message:
                  ('Need to wait 5 mins before sending friend request: ' +
                   remainingSeconds + ' second remaining')
            }
          };
        }
      }

      result = await db.query(
          `SELECT * FROM DeletedFriends WHERE user1_id = $1 AND user2_id = $2`,
          [id1, id2]);

      if (result.rowCount != 0) {
        const updatedAt = new Date(result.rows[0].created_at);
        const fiveMinutesLater =
            new Date(updatedAt.getTime() + 5 * 60 * 1000);  // 5 minutes in ms
        const now = new Date();

        if (fiveMinutesLater > now) {
          const remainingMs = fiveMinutesLater.getTime() - now.getTime();
          const remainingSeconds =
              Math.ceil(remainingMs / 1000);  // Optional: floor or ceil
          return {
            error: {
              status: 403,
              message:
                  ('Need to wait 5 mins before sending friend request: ' +
                   remainingSeconds + ' second remaining')
            }
          };
        }
      }

      result = await db.query(
          `SELECT * FROM Friendship WHERE user1_id = $1 AND user2_id = $2`,
          [id1, id2]);
      if (result.rowCount != 0) {
        return {
          error:
              {status: 400, message: 'You are already friends with this user'}
        };
      }

      await db.transaction(async (trx) => {
        await trx.query(
            `DELETE FROM DeletedFriends WHERE user1_id = $1 AND user2_id = $2`,
            [id1, id2]);

        result = await trx.query(
            `INSERT INTO FriendRequest (incoming_id, to_id) VALUES ($1, $2)
       RETURNING incoming_id, to_id`,
            [from, to]);
      });

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
          `UPDATE FriendRequest SET status = $3, updated_at = now() where incoming_id = $1 AND to_id = $2`,
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


  async deleteFriends(deletor: number, deleted: number): Promise<ResponseType> {
    try {
      const [id1, id2] =
          [Math.min(deletor, deleted), Math.max(deletor, deleted)];
      const result = await db.query(
          `SELECT * FROM Friendship WHERE user1_id = $1 AND user2_id = $2`,
          [id1, id2]);
      if (result.rowCount == 0) {
        return {error: {status: 400, message: 'These users are not friends'}};
      }
      await db.transaction(async (trx) => {
        await trx.query(
            `DELETE FROM Friendship WHERE user1_id = $1 AND user2_id = $2`,
            [id1, id2]);
        await trx.query(
            `DELETE FROM FriendRequest WHERE incoming_id = $1 AND to_id = $2`,
            [id1, id2]);
        await trx.query(
            `DELETE FROM FriendRequest WHERE incoming_id = $2 AND to_id = $1`,
            [id1, id2]);
        await trx.query(
            `INSERT INTO DeletedFriends (user1_id, user2_id) VALUES ($1, $2)`,
            [id1, id2]);
      });
      return {
        data: {deletor, deleted}
      }
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }
}
