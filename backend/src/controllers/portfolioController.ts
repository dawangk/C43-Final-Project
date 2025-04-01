import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import { PortfolioService } from '../services/portfolioService';

const portfolioService = new PortfolioService();

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,  // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const createPortfolio =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const {name} = req.body;

        const user_id = (req as any).user.user_id;
        const {data, error} =
            await portfolioService.createPortfolio(user_id, name);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

