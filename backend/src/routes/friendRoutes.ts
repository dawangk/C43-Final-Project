import express from 'express';

import {deleteFriends, getFriends, getIncomingFriendRequests, getOutgoingFriendRequests, sendFriendRequest, updateFriendRequest} from '../controllers/friendController';
import {authHandler} from '../middleware/authHandler';

export const friendRouter = express.Router();

friendRouter.post('/:id', authHandler, sendFriendRequest);
friendRouter.post('/update/:id', authHandler, updateFriendRequest);

friendRouter.get('/', authHandler, getFriends);
friendRouter.get('/incoming', authHandler, getIncomingFriendRequests);
friendRouter.get('/outgoing', authHandler, getOutgoingFriendRequests);

friendRouter.delete('/:id', authHandler, deleteFriends);