import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

/**
 * A higher-order function that wraps an asynchronous route handler.
 *
 * This function catches any errors thrown by the asynchronous handler and passes them to the next middleware.
 * It helps to avoid repetitive try-catch blocks in route handlers.
 *
 * @param fn - The asynchronous route handler function.
 * @returns A new function that wraps the original handler with error handling.
 */
const asyncHandler = (fn: AsyncFunction): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
  };
};

export default asyncHandler;
