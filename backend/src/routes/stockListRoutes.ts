import express from 'express';

import {createStockList, deleteStockList, getStockLists, getStockListStats, getStockListsWithData, updateStockEntry, updateStockList, updateStockListVisibility} from '../controllers/stockListController';
import {authHandler} from '../middleware/authHandler';

export const stockListRouter = express.Router();

stockListRouter.post('/', authHandler, createStockList);
stockListRouter.post('/:id', authHandler, updateStockEntry);

stockListRouter.get('/data/', authHandler, getStockListsWithData);
stockListRouter.get('/data/:id', authHandler, getStockListsWithData);

stockListRouter.get('/', authHandler, getStockLists);
stockListRouter.get('/:id', authHandler, getStockLists);

stockListRouter.put('/:id', authHandler, updateStockList);
stockListRouter.put('/toggle/:id', authHandler, updateStockListVisibility);

/* If provide symbol in body then deletes an entry. Otherwise deletes entire
 * list.*/
stockListRouter.delete('/:id', authHandler, deleteStockList);

stockListRouter.get('/stats/:id', authHandler, getStockListStats);