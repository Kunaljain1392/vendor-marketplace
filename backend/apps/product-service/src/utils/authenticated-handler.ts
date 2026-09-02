import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../types/auth";

export const authenticatedHandler =
  (
    handler: (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction,
    ) => void | Promise<void>,
  ) =>
  (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    void handler(
      req as AuthenticatedRequest,
      res,
      next,
    );
  };