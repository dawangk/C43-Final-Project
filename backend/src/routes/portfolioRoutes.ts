import express from 'express';

import {createPortfolio, deletePortfolio, getPortfolios, modifyFunds, updatePortfolio, getPortfolioWithData} from '../controllers/portfolioController';
import {authHandler} from '../middleware/authHandler';

export const portfolioRouter = express.Router();

portfolioRouter.post('/', authHandler, createPortfolio);

portfolioRouter.get('/data/:id', authHandler, getPortfolioWithData);
portfolioRouter.get('/data/', authHandler, getPortfolioWithData);

portfolioRouter.get('/:id', authHandler, getPortfolios);
portfolioRouter.get('/', authHandler, getPortfolios);

portfolioRouter.put('/:id', authHandler, updatePortfolio);
portfolioRouter.put('/modifyFund/:id', authHandler, modifyFunds);

portfolioRouter.delete('/:id', authHandler, deletePortfolio);