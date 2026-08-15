import type { ErrorRequestHandler } from "express";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};