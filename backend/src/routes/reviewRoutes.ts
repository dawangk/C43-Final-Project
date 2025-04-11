import express from 'express';

import {authHandler} from '../middleware/authHandler';
import { createReview, getReviews, updateReview, deleteReview } from '../controllers/reviewController';

export const reviewRouter = express.Router();

reviewRouter.post('/', authHandler, createReview);
reviewRouter.get('/:id', authHandler, getReviews);
reviewRouter.put('/:id', authHandler, updateReview);
// Delete my review
reviewRouter.delete('/:id', authHandler, deleteReview);
// Delete someone else's review
reviewRouter.delete('/:reviewer_id/:id', authHandler, deleteReview);