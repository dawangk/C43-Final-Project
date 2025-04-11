import {Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {ReviewService} from '../services/reviewService';

const reviewService = new ReviewService();

export const createReview =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const {sl_id, content} = req.body;

        const user_id = (req as any).user.user_id;
        const {data, error} =
            await reviewService.createReview(user_id, sl_id, content);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });
  
export const getReviews =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const sl_id = Number(req.params.id);
        const { data, error } = await reviewService.getReviews(sl_id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const updateReview =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const {content} = req.body;
        const sl_id = Number(req.params.id); 

        const user_id = (req as any).user.user_id;
        const {data, error} =
            await reviewService.updateReview(user_id, sl_id, content);

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const deleteReview =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const reviewer_id = req.params.reviewer_id
        const sl_id = req.params.id;

        const user_id = (req as any).user.user_id;
        let data, error;
        if(!reviewer_id) {
          ({data, error} =
              await reviewService.deleteReview(user_id, Number(sl_id)));
        }
        else {
          ({data, error} =
            await reviewService.deleteReview(Number(reviewer_id), Number(sl_id)));
        }

        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }

        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });
