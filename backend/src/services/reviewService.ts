import db from '../db/connectDb';
import {ResponseType} from '../models/response';

export class ReviewService {

  async createReview(user_id: number, sl_id: number, content: string): Promise<ResponseType> {
    try {
      if (!user_id || !sl_id || !content) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }

      if (content.length > 4000) {
        return {error: {status: 400, message: "Review length exceeds max length."}}
      }

      const result = await db.query(
          'INSERT INTO UserReview (user_id, sl_id, content) VALUES ($1, $2, $3) RETURNING sl_id',
          [user_id, sl_id, content]);

      return {
        data: {user_id, sl_id, content}
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async getReviews(sl_id: number): Promise<ResponseType> {
    try {
      if (!sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }
      const result = await db.query(
          'SELECT * FROM UserReview WHERE sl_id = $1', [sl_id]);
      return {data: result.rows};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async updateReview(user_id: number, sl_id: number, content: string): Promise<ResponseType> {
    try {
      if (!user_id || !sl_id || !content) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }

      if (content.length > 4000) {
        return {error: {status: 400, message: "Review length exceeds max length."}}
      }

      const result = await db.query(
          'UPDATE UserReview SET content = $1 WHERE sl_id = $2 AND user_id = $3 RETURNING user_id, sl_id, content',
          [content, sl_id, user_id]);
        
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no reviews on stock list found for user'}};
      }

      return {data: {message: 'Update successful!', content: result.rows[0]}};

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async deleteMyReview(reviewer_id: number, sl_id: number): Promise<ResponseType> {
    try {
      if (!reviewer_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }

      const result = await db.query(
          `
          DELETE FROM UserReview
          WHERE sl_id = $1 AND user_id = $2 
          RETURNING sl_id, user_id
          `,
          [sl_id, reviewer_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no reviews on stock list found for user'}};
      }
      return {data: {message: 'Delete successful!', content: result.rows[0]}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async deleteReview(reviewer_id: number, sl_id: number, user_id: number): Promise<ResponseType> {
    try {
      if (!reviewer_id || !sl_id) {
        return {error: {status: 400, message: 'Missing parameters.'}};
      }

      const result = await db.query(
          `
          DELETE FROM UserReview ur
          USING StockList sl 
          WHERE ur.sl_id = sl.sl_id AND sl.user_id = $3 AND ur.sl_id = $1 AND ur.user_id = $2 
          RETURNING ur.sl_id, ur.user_id
          `,
          [sl_id, reviewer_id, user_id]);
      if (result.rowCount == 0) {
        return {error: {status: 404, message: 'no reviews on stock list found for user'}};
      }
      return {data: {message: 'Delete successful!', content: result.rows[0]}};
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

}