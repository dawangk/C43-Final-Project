import express from 'express'
import {authHandler} from '../middleware/authHandler';
import { getStocks, getStock } from '../controllers/stockController';

export const stockRouter = express.Router();

stockRouter.get('/', authHandler, getStocks);
stockRouter.get('/:symbol', authHandler, getStock);