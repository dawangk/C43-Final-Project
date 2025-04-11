import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {ShareService} from '../services/shareService';

const shareService = new ShareService();

export const shareSLWithFriend =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {email} = req.body;
        const {data, error} =
            await shareService.shareSLWithFriend(user_id, id, email);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const getUsersShared =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {data, error} = await shareService.getUsersShared(user_id, id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });
