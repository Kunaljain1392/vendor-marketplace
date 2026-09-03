import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { AppError } from "../shared/errors/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    logger.warn(
      {
        method: req.method,
        path: req.originalUrl,
        issues: error.issues,
      },
      "Request validation failed",
    );

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof AppError) {
    logger.warn(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: error.statusCode,
        message: error.message,
      },
      "Request failed",
    );

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  logger.error(
    {
      method: req.method,
      path: req.originalUrl,
      error,
    },
    "Unhandled request error",
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};