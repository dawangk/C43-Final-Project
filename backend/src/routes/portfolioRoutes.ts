import express from 'express';
import multer from 'multer';

import {createPortfolio, deletePortfolio, getPortfolios, getPortfolioWithData, modifyFunds, updatePortfolio, uploadPortfolioData} from '../controllers/portfolioController';
import {authHandler} from '../middleware/authHandler';


const upload = multer({dest: 'uploads/'});
export const portfolioRouter = express.Router();

portfolioRouter.post('/', authHandler, createPortfolio);

portfolioRouter.get('/data/:id', authHandler, getPortfolioWithData);
portfolioRouter.get('/data/', authHandler, getPortfolioWithData);

portfolioRouter.get('/:id', authHandler, getPortfolios);
portfolioRouter.get('/', authHandler, getPortfolios);

portfolioRouter.put('/:id', authHandler, updatePortfolio);
portfolioRouter.put('/modifyFund/:id', authHandler, modifyFunds);

portfolioRouter.delete('/:id', authHandler, deletePortfolio);

portfolioRouter.post(
    '/data/:id', authHandler, upload.single('file'), uploadPortfolioData);
