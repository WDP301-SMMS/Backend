import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction 
) => {
  const statusCode = err.status || 500;
  const publicMessage = err.status ? err.message : "Internal Server Error";

  console.error(
    `[SERVER LOG] ----\n` +
    `Timestamp: ${new Date().toISOString()}\n` +
    `Status: ${statusCode}\n` +
    `Message: ${err.message}\n` +
    `Stack: ${err.stack}\n` +
    `----`
  );

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      success: false,
      message: publicMessage,
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
};