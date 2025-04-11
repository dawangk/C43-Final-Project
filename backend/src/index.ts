
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {Express} from 'express';
import {Server} from 'http';

import db from './db/connectDb';
import asyncHandler from './middleware/asyncHandler';
import {friendRouter} from './routes/friendRoutes';
import {portfolioRouter} from './routes/portfolioRoutes';
import {stockListRouter} from './routes/stockListRoutes';
import {stockRouter} from './routes/stockRoutes';
import {authRouter} from './routes/userRoutes';
import { reviewRouter } from './routes/reviewRoutes';

const app: Express = express();
const HOST = 'localhost';
const PORT = process.env.PORT || 8081;
let server: Server;

app.use(cors({origin: process.env.CLIENT_APP_URL, credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use('/api/stock', stockRouter);
app.use('/api/stocklist', stockListRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/review', reviewRouter);
app.use('/auth', authRouter);
app.use('/friend', friendRouter);


/**
 * Root route to test the backend server.
 * @route GET /
 */
app.get(
    '/',
    asyncHandler(async (_, res) => {
      try {
        const result = await db.query('SELECT * FROM testtbl');
        // const client = await db.getClient();
        res.json(result.rows);
        // res.json(client)
      } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({error: 'Failed to fetch test data'});
      }
    }),
);

server = app.listen(PORT, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});

// graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.info('Server closed');

      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};


process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

export {server};

export default app;