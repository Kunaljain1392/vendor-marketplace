import type {
  NextFunction,
  Request,
  Response,
} from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../utils/app-error";

type UserRole =
  | "CUSTOMER"
  | "VENDOR"
  | "ADMIN";

interface AccessTokenPayload {
  userId: string;
  role: unknown;
}

const isValidRole = (
  role: unknown,
): role is UserRole => {
  return (
    role === "CUSTOMER" ||
    role === "VENDOR" ||
    role === "ADMIN"
  );
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader =
    req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(
      new AppError(
        "Authentication required",
        401,
      ),
    );
    return;
  }

  const token = authHeader
    .substring(7)
    .trim();

  if (!token) {
    next(
      new AppError(
        "Authentication required",
        401,
      ),
    );
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as AccessTokenPayload;

    if (
      typeof decoded.userId !== "string" ||
      !decoded.userId ||
      !isValidRole(decoded.role)
    ) {
      next(
        new AppError(
          "Invalid access token",
          401,
        ),
      );
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    req.accessToken = token;

    next();
  } catch {
    next(
      new AppError(
        "Invalid or expired access token",
        401,
      ),
    );
  }
};