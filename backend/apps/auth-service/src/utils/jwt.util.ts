
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.config.js';


export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface VerifyEmailPayload {
  userId: string;
}

export const generateAccessToken = (
  payload: AccessTokenPayload
): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (
  payload: RefreshTokenPayload
): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const generateTokens = (
  userId: string,
  role: string
) => {

  const accessToken = generateAccessToken({
    userId,
    role,
  });

  const refreshToken = generateRefreshToken({
    userId,
  });

  const refreshTokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
  };
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  
    return jwt.verify(
    token,
    env.JWT_ACCESS_SECRET
  ) as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET
  ) as RefreshTokenPayload;
};

export const decodeToken = (
  token: string
): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};

export interface ResetPasswordPayload {
  userId: string;
}

export const generateResetPasswordToken = (
  payload: ResetPasswordPayload
): string => {
  return jwt.sign(
    payload,
    env.JWT_RESET_PASSWORD_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const verifyResetPasswordToken = (
  token: string
): ResetPasswordPayload => {
  const payload = jwt.verify(
    token,
    env.JWT_RESET_PASSWORD_SECRET
  );

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("userId" in payload)
  ) {
    throw new Error("Invalid reset password token");
  }

  return payload as ResetPasswordPayload;
};

export const verifyEmailToken = (
  token: string
): VerifyEmailPayload => {
  const payload = jwt.verify(
    token,
    env.JWT_VERIFY_EMAIL_SECRET
  );

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("userId" in payload)
  ) {
    throw new Error("Invalid verification token");
  }

  return {
    userId: payload.userId as string,
  };
};
