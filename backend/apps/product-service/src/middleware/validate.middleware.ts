import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { AppError } from "../utils/app-error.js";

type RequestPart = "body" | "params" | "query";

export const validate = (
  schema: ZodType,
  part: RequestPart = "body",
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(
        new AppError(
          "Invalid request data",
          400,
        ),
      );
      return;
    }

    req[part] = result.data;

    next();
  };
};