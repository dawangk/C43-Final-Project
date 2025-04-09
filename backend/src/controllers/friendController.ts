import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {FriendService} from '../services/friendService';

const friendService = new FriendService();

export const sendFriendRequest =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {data, error} =
            await friendService.sendFriendRequest(user_id, id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const acceptFriendRequest =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {data, error} =
            await friendService.acceptFriendRequest(user_id, id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });