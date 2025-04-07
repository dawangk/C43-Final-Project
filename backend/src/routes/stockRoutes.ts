import express from 'express'
import {authHandler} from '../middleware/authHandler';
import { getStocks, getStock, getStockHistory } from '../controllers/stockController';

export const stockRouter = express.Router();

stockRouter.get('/', authHandler, getStocks);
stockRouter.get('/history/:symbol', authHandler, getStockHistory);
stockRouter.get('/:symbol', authHandler, getStock);