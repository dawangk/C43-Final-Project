import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {UserService} from '../services/userService';

const userService = new UserService();

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,  // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {username, email, password} = req.body;
    const {data, error} = await userService.signUp(username, email, password);

    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    const {data, error} = await userService.login(email, password);

    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }
    res.cookie('token', data.token, COOKIE_OPTIONS);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Clear token from cookies if it exists
    res.clearCookie('token');

    // Handle case when no token is present
    return res.status(200).json(
        {message: 'Logged out successfully or no active session.'});
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  try {
     // Get the token from the request (either from Authorization header or
    // cookies)
    const token =
        req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        message: 'Unauthorized. No token provided.'
      });
      return;
    }

    const {data, error} = await userService.me(token);

    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Session Error:', error);
    res.status(500).json({error: error.message});
  }
});