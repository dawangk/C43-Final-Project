import express from 'express';

import {sendFriendRequest} from '../controllers/friendController';
import {authHandler} from '../middleware/authHandler';

export const friendRouter = express.Router();

friendRouter.post('/:id', authHandler, sendFriendRequest);
