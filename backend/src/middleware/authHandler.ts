import {CookieOptions, NextFunction, Request, Response} from 'express';

import {UserService} from '../services/userService';

import asyncHandler from './asyncHandler';

const userService = new UserService();


const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,  // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};


interface AuthenticatedRequest extends Request {
  user?: any;
}


export const authHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // Check access token in cookies to determine if authorized
      const access_token = req.cookies.token;
      try {
        // Verify the session
        if (!access_token) {
          res.clearCookie('token');
          return res.status(401).json({message: 'Invalid or expired session'});
        }

        const {data, error} = await userService.me(access_token);

        if (error) {
          return res.status(404).json({message: 'Could not get user'});
        }

        // Attach user to request for route handlers to access later
        req.user = data;

        next();
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    },
);