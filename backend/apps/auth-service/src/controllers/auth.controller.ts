// apps/auth-service/src/controllers/auth.controller.ts

import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../schemas/auth.schema.js";
import { ZodError } from "zod";
// import { AuthRequest } from '../middleware/auth.middleware.js'; // Naya import
import { userRepository } from "../repositories/user.repository.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../exceptions/app.exception.js";

export class AuthController {
  // Registration handle karne ka function (arrow function taaki 'this' ka issue na aaye)
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Zod se data check karein (Validation)
      const validatedData = registerSchema.parse({ body: req.body });

      // 2. Service ko data bhejein naya user banane ke liye
      const user = await authService.register(validatedData.body);

      // 3. Postman/Frontend ko success message bhejein
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      // Agar Zod validation fail ho jaye (jaise password chota ho)
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: error.message,
        });
        return;
      }

      // Agar koi aur error aaye (jaise Email already exists)
      res.status(400).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Zod se data check karein
      const validatedData = loginSchema.parse({ body: req.body });

      // 2. Service se login karwayein
      const result = await authService.loginUser(validatedData.body);

      // 3. Success response bhejein
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: error.message,
        });
        return;
      }

      res.status(401).json({
        // 401 matlab Unauthorized
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  };

  // ... (login logic)

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      // req.user wahi data hai jo humne token banate waqt daala tha (jaise userId)
      if (!req.user) {
        throw new Error("Unauthorized");
      }

      const userId = req.user.userId;

      // Database se user dhundho
      const user = await userRepository.findById(userId);

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Password hata kar baaki data return karo
      const { passwordHash, ...userProfile } = user;

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = changePasswordSchema.parse({ body: req.body });
      if (!req.user) {
        throw new Error("Unauthorized");
      }

      const result = await authService.changePassword(
        req.user.userId,
        validatedData.body,
      );
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = forgotPasswordSchema.parse({ body: req.body });
      const result = await authService.forgotPassword(validatedData.body.email);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = resetPasswordSchema.parse({ body: req.body });
      const result = await authService.resetPassword(validatedData.body);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, "Refresh token is required");
    }

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};

  // logout = async (req: AuthRequest, res: Response): Promise<void> => {
  //   // TODO: Jab Redis aayega, hum is token ko Blacklist mein daal denge
  //   // Abhi ke liye bas client ko bol rahe hain ki apne paas se token delete kar do
  //   res.status(200).json({ success: true, message: "Logged out successfully. Please remove token from client." });
  // };

verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = verifyEmailSchema.parse({
      query: req.query,
    });

    logger.info("Verifying email");

    const result = await authService.verifyEmail(
      validatedData.query.token
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Access token is required");
    }

    const accessToken = authHeader.substring(7);

    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, "Refresh token is required");
    }

    const result = await authService.logout(
      accessToken,
      refreshToken
    );

    res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};

resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData =
      resendVerificationSchema.parse({
        body: req.body,
      });

    const result =
      await authService.resendVerification(
        validatedData.body.email
      );

    res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};

}

export const authController = new AuthController();
