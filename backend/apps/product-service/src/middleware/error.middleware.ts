import type { ErrorRequestHandler } from "express";

import { logger } from "../config/logger";
import { AppError } from "../utils/app-error";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  logger.error(
    { error },
    "Unexpected application error",
  );

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};