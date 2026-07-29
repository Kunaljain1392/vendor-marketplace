import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";

interface VerifyEmailPayload {
  userId: string;
  email: string;
}

export const generateVerifyEmailToken = (
  payload: VerifyEmailPayload
) => {
  return jwt.sign(payload, env.JWT_VERIFY_EMAIL_SECRET, {
    expiresIn: "10m",
  });
};