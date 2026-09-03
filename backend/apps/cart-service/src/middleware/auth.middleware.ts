import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

interface JwtPayload {
  userId: string;
  role: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      logger.warn(
        {
          method: req.method,
          path: req.originalUrl,
        },
        "Authentication token missing",
      );

      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const token = authorization.substring(7);

    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

    if (!decoded.userId || !decoded.role) {
      logger.warn(
        {
          method: req.method,
          path: req.originalUrl,
        },
        "Invalid JWT payload",
      );

      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });

      return;
    }

    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.warn(
      {
        method: req.method,
        path: req.originalUrl,
        error,
      },
      "JWT authentication failed",
    );

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}