import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {StockListService} from '../services/stockListService';

const stockListService = new StockListService();

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,  // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const createStockList =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const {name} = req.body;

        const user_id = (req as any).user.user_id;
        const {data, error} =
            await stockListService.createStockList(user_id, name);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const getStockLists =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        let data, error;
        console.log(id);
        if (id) {
          ({data, error} =
               await stockListService.getStockListById(user_id, id));
        } else {
          ({data, error} = await stockListService.getStockLists(user_id));
        }
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const updateStockList =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {name} = req.body;

        const {data, error} =
            await stockListService.updateStockList(user_id, id, name);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const deleteStockList =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;

        const {data, error} =
            await stockListService.deleteStockList(user_id, id);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });