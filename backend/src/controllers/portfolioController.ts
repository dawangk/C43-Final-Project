import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {PortfolioService} from '../services/portfolioService';

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

export const getPortfolios =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        let data, error;
        console.log(id);
        if (id) {
          ({data, error} =
               await portfolioService.getPortfolioById(user_id, id));
        } else {
          ({data, error} = await portfolioService.getPortfolios(user_id));
        }
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error', error});
      }
    });

export const updatePortfolio =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {name} = req.body;

        const {data, error} =
            await portfolioService.updatePortfolio(user_id, id, name);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const deletePortfolio =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;

        const {data, error} =
            await portfolioService.deletePortfolio(user_id, id);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const modifyFunds = asyncHandler(async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user_id = (req as any).user.user_id;
    const {amount} = req.body;

    const {data, error} =
        await portfolioService.modifyFunds(user_id, id, amount);

    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});