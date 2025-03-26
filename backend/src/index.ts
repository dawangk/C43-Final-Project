import express, { Express } from "express";
import { Server } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import asyncHandler from "./middleware/asyncHandler";
import db from "./db/connectDb";

const app: Express = express();
const HOST = "localhost";
const PORT = process.env.PORT || 8081;
let server: Server;

app.use(cors({ origin: process.env.CLIENT_APP_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/**
 * Root route to test the backend server.
 * @route GET /
 */
app.get(
  "/",
  asyncHandler(async (_, res) => {
    try {
      const result = await db.query('SELECT * FROM testtbl');
      // const client = await db.getClient();
      res.json(result.rows);
      // res.json(client)
    } catch (error) {
      console.error('Query error:', error);
      res.status(500).json({ error: 'Failed to fetch test data' });
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
      console.info("Server closed");
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

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

export { server };
export default app;