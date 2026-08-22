import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { logger } from "../config/logger.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    logger.warn(
      {
        statusCode: error.statusCode,
        message: error.message,
      },
      "Application error",
    );

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  logger.error(
    {
      error,
    },
    "Unexpected server error",
  );

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};