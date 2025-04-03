import express from 'express';

import {createPortfolio, deletePortfolio, getPortfolios, modifyFunds, updatePortfolio} from '../controllers/portfolioController';
import {authHandler} from '../middleware/authHandler';

export const portfolioRouter = express.Router();

portfolioRouter.post('/', authHandler, createPortfolio);

portfolioRouter.get('/:id', authHandler, getPortfolios);
portfolioRouter.get('/', authHandler, getPortfolios);

portfolioRouter.put('/:id', authHandler, updatePortfolio);
portfolioRouter.put('/modifyFund/:id', authHandler, modifyFunds);

portfolioRouter.delete('/:id', authHandler, deletePortfolio);