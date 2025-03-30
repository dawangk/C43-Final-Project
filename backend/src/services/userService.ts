import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import db from '../db/connectDb';
import {ResponseType} from '../models/response';

interface JwtPayload {
  userId: number;
}

export class UserService {
  async signUp(username: string, email: string, password: string):
      Promise<ResponseType> {
    try {
      if (!username || !password || !email) {
        return {
          error: {
            status: 400,
            message: 'At least 1 of username, email or password is missing.'
          }
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
          'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id',
          [username, email, hashedPassword]);

      const token = jwt.sign(
          {userId: result.rows[0].user_id}, process.env.JWT_SECRET as string,
          {expiresIn: '1h'});
      return {data: {message: 'User registered successfully!', token}};
    } catch (error: any) {
      if (error.code === '23505') {
        return {
          error: {status: 400, message: 'Username or email already in use.'}
        };
      }
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }

  async login(email: string, password: string): Promise<ResponseType> {
    try {
      if (!password || !email) {
        return {error: {status: 400, message: 'Email or password missing.'}};
      }

      const result =
          await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
            {userId: user.user_id}, process.env.JWT_SECRET as string,
            {expiresIn: '1h'});
        return {data: {message: 'User logged in sucessfully.', token}};
      } else {
        return {error: {status: 401, message: 'Invalid email or password'}};
      }

    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'internal server error'}
      };
    }
  }


  async me(req: any): Promise<ResponseType> {
    try {
      // Get the token from the request (either from Authorization header or
      // cookies)
      const token =
          req.cookies.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return {
          error: {status: 401, message: 'Unauthorized. No token provided.'}
        };
      }

      // Verify the token
      const decoded =
          jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Get user ID from the decoded token
      const userId = decoded.userId;

      // Query the database to get the current user's details
      const result = await db.query(
          'SELECT username, email, created_at FROM users WHERE user_id = $1',
          [userId]);

      if (result.rows.length === 0) {
        return {error: {status: 404, message: 'User not found.'}};
      }

      // Return the user data
      const user = result.rows[0];
      return {
        data: {
          user_id: userId,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        }
      };
    } catch (error: any) {
      return {
        error: {status: 500, message: error.message || 'Internal server error'}
      };
    }
  }
}
