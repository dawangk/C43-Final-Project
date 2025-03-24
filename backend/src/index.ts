import express, { Express } from "express";
import { Server } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import asyncHandler from "./middleware/asyncHandler";

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
  asyncHandler(async (_, response) =>
    response.json({
      info: "Testing course matrix backend server",
    }),
  ),
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