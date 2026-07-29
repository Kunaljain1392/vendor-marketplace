import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../exceptions/app.exception.js";
import {
  generateTokens,
  generateVerifyEmailToken,
  verifyAccessToken,
  verifyEmailToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import { Prisma, Role } from "@prisma/client";
import { redisClient } from "../config/redis.js";
import jwt from "jsonwebtoken";
import { refreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";
import { EXCHANGES, ROUTING_KEYS } from "../constants/rabbitmq.constants.js";
import { getChannel } from "../config/rabbitmq.js";
import type {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  ResetPasswordDTO,
} from "../schemas/auth.schema.js";
import { date } from "zod";
import { emailService } from "./email.service.js";
import { publishEvent } from "../events/publisher.js";


export class AuthService {
private async publishUserRegistered(
  user: {
    id: string;
    email: string;
    firstName: string;
    role: Role;
  }
): Promise<void> {
  try {
    await publishEvent(
      EXCHANGES.AUTH,
      ROUTING_KEYS.USER_REGISTERED,
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      }
    );

    logger.info(
      {
        userId: user.id,
      },
      "USER_REGISTERED event published"
    );
  } catch (error) {
    logger.error(
      error,
      "Failed to publish USER_REGISTERED event"
    );

    // Event publishing failure should not block user registration.
  }
}

private async publishUserVerified(
  user: {
    id: string;
    email: string;
  }
): Promise<void> {
  try {
    await publishEvent(
      EXCHANGES.AUTH,
      ROUTING_KEYS.USER_VERIFIED,
      {
        userId: user.id,
        email: user.email,
        verifiedAt: new Date().toISOString(),
      }
    );

    logger.info(
      { userId: user.id },
      "USER_VERIFIED event published"
    );
  } catch (error) {
    logger.error(
      error,
      "Failed to publish USER_VERIFIED event"
    );

    // Event publishing failure should not block email verification.
  }
}

private async publishPasswordChanged(
  user: {
    id: string;
    email: string;
  }
): Promise<void> {
  try {
    await publishEvent(
      EXCHANGES.AUTH,
      ROUTING_KEYS.PASSWORD_CHANGED,
      {
        userId: user.id,
        email: user.email,
        changedAt: new Date().toISOString(),
      }
    );

    logger.info(
      {
        userId: user.id,
      },
      "PASSWORD_CHANGED event published"
    );

  } catch (error) {

    logger.error(
      error,
      "Failed to publish PASSWORD_CHANGED event"
    );

    // Event publishing failure should not block password change.
  }
}

  private async ensureEmailAvailable(email: string): Promise<void> {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(409, "User with this email already exists");
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private removePassword<T extends { passwordHash: string }>(
    user: T,
  ): Omit<T, "passwordHash"> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private async validateUserCredentials(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const passwordMatched = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatched) {
      throw new AppError(401, "Invalid email or password");
    }

    return user;
  }

  private async revokeUserRefreshTokens(
    userId: string,
    tx: Prisma.TransactionClient,
  ) {
    await tx.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  private async getValidRefreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    const refreshToken = await refreshTokenRepository.findByToken(token);

    if (!refreshToken) {
      throw new AppError(401, "Invalid refresh token");
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new AppError(401, "Refresh token expired");
    }

    return {
      payload,
      refreshToken,
    };
  }

  async register(data: RegisterDTO) {
    await this.ensureEmailAvailable(data.email);

    const passwordHash = await this.hashPassword(data.password);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await userRepository.create(
        {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        },
        tx,
      );

      // 2. Generate Tokens
      // const { accessToken, refreshToken, refreshTokenExpiresAt } =
      //   generateTokens(user.id, user.role);

      // generate verification token
      const verificationToken = generateVerifyEmailToken({
        userId: user.id,
        email: user.email,
      });

      // 3. Save Refresh Token
      // await refreshTokenRepository.create(
      //   {
      //     token: refreshToken,
      //     expiresAt: refreshTokenExpiresAt,
      //     user: {
      //       connect: {
      //         id: user.id,
      //       },
      //     },
      //   },
      //   tx,
      // );

      // 4. Remove password
      const { passwordHash: _, ...safeUser } = user;

      // 5. TODO
      // publish USER_REGISTERED event

      return {
        safeUser,
        verificationToken,
      };
    });
    // 5. Send Verification Email
    await emailService.sendVerificationEmail(
      result.safeUser.email,
      result.safeUser.firstName,
      result.verificationToken,
    );

    // 6. Return Response
    return {
      message:
        "Registration successful. Please verify your email before logging in.",
    };
  }

  async loginUser(data: LoginDTO) {
    const user = await this.validateUserCredentials(data.email, data.password);
    if (!user.isVerified) {
      throw new AppError(403, "Please verify your email before logging in.");
    }
    return prisma.$transaction(async (tx) => {
      // Revoke old refresh tokens
      await this.revokeUserRefreshTokens(user.id, tx);

      // Generate new tokens
      const { accessToken, refreshToken, refreshTokenExpiresAt } =
        generateTokens(user.id, user.role);

      // Save refresh token
      await refreshTokenRepository.create(
        {
          token: refreshToken,
          expiresAt: refreshTokenExpiresAt,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        tx,
      );

      return {
        user: this.removePassword(user),
        accessToken,
        refreshToken,
      };
    });
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const passwordMatched = await bcrypt.compare(
      data.oldPassword,
      user.passwordHash,
    );

    if (!passwordMatched) {
      throw new AppError(401, "Invalid old password");
    }

    const passwordHash = await this.hashPassword(data.newPassword);

    await userRepository.update(userId, {
      passwordHash,
    });

    await this.publishPasswordChanged(user);
    
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
    

    return {
      message: "Password changed successfully",
    };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return {
        message: "If the email exists, a reset link has been sent.",
      };
    }

    // TODO
    // Generate reset token
    // Publish RabbitMQ event

    return {
      message: "If the email exists, a reset link has been sent.",
    };
  }

  async resetPassword(data: ResetPasswordDTO) {
  try {
    const decoded = jwt.verify(data.token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Fetch user
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const passwordHash = await this.hashPassword(data.newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: decoded.userId,
        },
        data: {
          passwordHash,
        },
      });

      await tx.refreshToken.deleteMany({
        where: {
          userId: decoded.userId,
        },
      });
    });

    await this.publishPasswordChanged(user);

    return {
      message: "Password reset successfully",
    };
  } catch {
    throw new AppError(401, "Invalid or expired reset token");
  }
}

  async refreshToken(oldRefreshToken: string) {
    const { payload, refreshToken } =
      await this.getValidRefreshToken(oldRefreshToken);

    return prisma.$transaction(async (tx) => {
      // 1. Delete old refresh token
      await refreshTokenRepository.delete(refreshToken.id, tx);

      // 2. Get user
      const user = await userRepository.findById(payload.userId);

      if (!user) {
        throw new AppError(404, "User not found");
      }

      // 3. Generate new tokens
      const {
        accessToken,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt,
      } = generateTokens(user.id, user.role);

      // 4. Save new refresh token
      await refreshTokenRepository.create(
        {
          token: newRefreshToken,
          expiresAt: refreshTokenExpiresAt,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        tx,
      );

      // 5. Return new tokens
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    });
  }

  async verifyEmail(token: string) {
    try {
      // 1. Verify JWT
      const payload = verifyEmailToken(token);

      // 2. Find User
      const user = await userRepository.findById(payload.userId);

      if (!user) {
        throw new AppError(404, "User not found");
      }

      // 3. Check if already verified
      if (user.isVerified) {
        return {
          message: "Email is already verified.",
        };
      }

      // 4. Mark user as verified
      await userRepository.update(user.id, {
        isVerified: true,
      });
      await this.publishUserVerified(user);
      return {
        message: "Email verified successfully.",
      };
    } catch {
      throw new AppError(400, "Invalid or expired verification link.");
    }
  }

  async logout(accessToken: string, refreshToken: string) {
    const payload = verifyAccessToken(accessToken);

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({
        where: {
          userId: payload.userId,
          token: refreshToken,
        },
      });

      const decoded = jwt.decode(accessToken) as {
        exp?: number;
      };

      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);

        if (ttl > 0) {
          await redisClient.set(`bl_${accessToken}`, "true", "EX", ttl);
        }
      }
    });

    return {
      message: "Logged out successfully",
    };
  }

  async resendVerification(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(404, "User not found");
    }
    if (user.isVerified) {
      throw new AppError(400, "Email is already verified.");
    }
    const verificationToken = generateVerifyEmailToken({
      userId: user.id,
      email: user.email,
    });

    await emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken,
    );
    return {
      message: "Verification email sent successfully.",
    };
  }
}

export const authService = new AuthService();
