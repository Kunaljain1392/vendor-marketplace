import type { AuthenticatedUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      accessToken?: string;
    }
  }
}

export {};