import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.js";
import { AppError } from "../exceptions/app.exception.js";
import { verifyAccessToken } from "../utils/jwt.util.js";

// export interface AuthRequest extends Request {
//   user: ReturnType<typeof verifyAccessToken>;
// }

export const authenticateJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "Access token is required"
      );
    }

    const token = authHeader.substring(7);

    // Check Redis blacklist
    const blacklisted = await redisClient.get(
      `bl_${token}`
    );

    if (blacklisted) {
      throw new AppError(
        401,
        "Access token has been revoked"
      );
    }

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();

  } catch (error) {
    next(error);
  }
};