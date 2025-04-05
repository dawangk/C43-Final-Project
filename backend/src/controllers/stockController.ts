import asyncHandler from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { StockService } from "../services/stockService";

const stockService = new StockService();

export const getStocks =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const { search } = req.query;
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

export const getStock =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const symbol = req.params.symbol;
        const {data, error} = await stockService.getStock(symbol);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });