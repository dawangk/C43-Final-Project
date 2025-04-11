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
        const {type} = req.body;
        let data, error;
        console.log(id);
        if (id) {
          ({data, error} =
               await stockListService.getStockListById(user_id, id));
        } else {
          switch (type) {
            case 'shared':
              ({data, error} =
                   await stockListService.getSharedStockLists(user_id));
              break;
            case 'public':
              ({data, error} = await stockListService.getPublicStockLists());
              break;
            default:
              ({data, error} = await stockListService.getStockLists(user_id));
              break;
          }
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

export const getStockListsWithData =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id
        let data, error;
        let {type} = req.body;
        if (!type) {
          type = 'owned';
        }
        if (id) {
          ({data, error} =
               await stockListService.getStockListByIdWithData(user_id, id));
        } else {
          switch (type) {
            case 'shared':
              ({data, error} =
                   await stockListService.getSharedStockListsWithData(user_id));
              break;
            case 'public':
              ({data, error} =
                   await stockListService.getPublicStockListsWithData());
              break;
            default:
              ({data, error} =
                   await stockListService.getStockListsWithData(user_id));
              break;
          }
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
        const {symbol} = req.body;

        let data, error;

        if (symbol) {
          ({data, error} =
               await stockListService.deleteStockEntry(user_id, id, symbol));
        } else {
          ({data, error} = await stockListService.deleteStockList(user_id, id));
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

export const updateStockEntry =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {symbol, amount} = req.body;
        const {data, error} = await stockListService.updateStockEntry(
            user_id, id, symbol, amount);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const getStockListStats =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {period} = req.query;
        const {data, error} = await stockListService.getStockListStats(
            user_id, id, period as string);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error', error});
      }
    });