import express from 'express'
import {authHandler} from '../middleware/authHandler';
import { getStocks, getStock, getStockHistory, getStockPrediction } from '../controllers/stockController';

export const stockRouter = express.Router();

stockRouter.get('/', authHandler, getStocks);
stockRouter.get('/history/:symbol', authHandler, getStockHistory);
stockRouter.get('/history/:symbol/:id', authHandler, getStockHistory);
stockRouter.get('/prediction/:symbol', authHandler, getStockPrediction);
stockRouter.get('/prediction/:symbol/:id', authHandler, getStockPrediction);
stockRouter.get('/:symbol', authHandler, getStock);