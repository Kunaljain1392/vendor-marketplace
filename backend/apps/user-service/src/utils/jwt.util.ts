import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export const verifyAccessToken = (
  token: string,
): AccessTokenPayload => {
  const payload = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
  );

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.userId !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("Invalid access token");
  }

  return {
    userId: payload.userId,
    role: payload.role,
  };
};