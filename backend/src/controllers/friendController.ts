import {CookieOptions, Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler';
import {FriendService} from '../services/friendService';

const friendService = new FriendService();

export const sendFriendRequest =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const { email } = req.body;
        const user_id = (req as any).user.user_id;
        const {data, error} =
            await friendService.sendFriendRequest(user_id, email);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const updateFriendRequest =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const {status} = req.body;
        const user_id = (req as any).user.user_id;
        const {data, error} =
            await friendService.updateFriendRequest(id, user_id, status);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.user_id;
    const {data, error} = await friendService.getFriends(user_id);
    if (error) {
      res.status(error.status).json({message: error.message});
      return;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const getOutgoingFriendRequests =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const user_id = (req as any).user.user_id;
        const {data, error} =
            await friendService.getOutgoingFriendRequests(user_id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const getIncomingFriendRequests =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const user_id = (req as any).user.user_id;
        const {data, error} =
            await friendService.getIncomingFriendRequests(user_id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });

export const deleteFriends =
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const user_id = (req as any).user.user_id;
        const {data, error} = await friendService.deleteFriends(user_id, id);
        if (error) {
          res.status(error.status).json({message: error.message});
          return;
        }
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({message: 'Internal Server Error'});
      }
    });