import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "./auth";

export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;