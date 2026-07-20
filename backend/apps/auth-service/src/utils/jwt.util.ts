
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';

export const generateTokens = (userId: string, role: string) => {
  // Access Token: Short-lived (e.g., 15 minutes)
  const accessToken = jwt.sign(
    { userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh Token: Long-lived (e.g., 7 days)
  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};