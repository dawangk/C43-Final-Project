import {Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {StockService} from '../services/stockService';

const stockService = new StockService();

export const getStocks = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {search} = req.query;
    console.log(search)
    const {data, error} = await stockService.getStocks(search as string);

    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const getStock = asyncHandler(async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol;
    const {port_id} = req.body;
    const {data, error} = await stockService.getStock(symbol, port_id);

    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const getStockHistory =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const symbol = req.params.symbol;


        const id = req.params.id ? Number(req.params.id) : undefined;

        const {period} = req.query;

        console.log('Period:', period)
        const {data, error} =
            await stockService.getStockHistory(symbol, period as string, id);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });


export const getStockPrediction =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const symbol = req.params.symbol;

        const id = req.params.id ? Number(req.params.id) : undefined;

        const {period} = req.query;
        const {data, error} =
            await stockService.getStockPrediction(symbol, period as string, id);


        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });