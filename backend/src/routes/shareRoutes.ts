import express from 'express';

import {getUsersShared, shareSLWithFriend} from '../controllers/shareController';
import {authHandler} from '../middleware/authHandler';

export const shareRouter = express.Router();

shareRouter.post('/:id', authHandler, shareSLWithFriend);
shareRouter.get('/:id', authHandler, getUsersShared);