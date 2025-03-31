import express from 'express';

import {createStockList, deleteStockList, getStockLists, updateStockEntry, updateStockList} from '../controllers/stockListController';

import {authHandler} from '../middleware/authHandler';

export const stockListRouter = express.Router();

stockListRouter.post('/', authHandler, createStockList);
stockListRouter.post('/:id', authHandler, updateStockEntry);


stockListRouter.get('/', authHandler, getStockLists);
stockListRouter.get('/:id', authHandler, getStockLists);

stockListRouter.put('/:id', authHandler, updateStockList);

stockListRouter.delete('/:id', authHandler, deleteStockList);
