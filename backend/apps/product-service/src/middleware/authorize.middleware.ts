import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/app-error";

export const authorize = (...allowedRoles: string[]) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      next(
        new AppError(
          "Authentication required",
          401,
        ),
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          "You are not authorized to perform this action",
          403,
        ),
      );
      return;
    }

    next();
  };
};