import type { Request } from "express";

export interface AuthenticatedUser {
  userId: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  accessToken: string;
}