

import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../exceptions/app.exception.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util.js';
import { Prisma, Role } from "@prisma/client";
import { redisClient } from '../config/redis.js';
import jwt from 'jsonwebtoken';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { EXCHANGES, ROUTING_KEYS } from '../constants/rabbitmq.constants.js';
import { getChannel } from '../config/rabbitmq.js';
import type {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  ResetPasswordDTO,
} from "../schemas/auth.schema.js";


export class AuthService {

//   private async publishUserRegistered(
//   user: {
//     id: string;
//     email: string;
//     firstName: string;
//     role: Role;
//   }
// ): Promise<void> {
//   try {
//     const channel = getChannel();

//     channel.publish(
//       EXCHANGES.AUTH,
//       ROUTING_KEYS.USER_REGISTERED,
//       Buffer.from(
//         JSON.stringify({
//           userId: user.id,
//           email: user.email,
//           firstName: user.firstName,
//           role: user.role,
//         })
//       ),
//       {
//         persistent: true,
//       }
//     );

//     logger.info(
//       {
//         userId: user.id,
//       },
//       "USER_REGISTERED event published"
//     );

//   } catch (error) {

//     logger.error(
//       error,
//       "Failed to publish USER_REGISTERED event"
//     );

//     // User registration should NOT fail
//   }
// }

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
  user: T
): Omit<T, "passwordHash"> {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

private async validateUserCredentials(
  email: string,
  password: string
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatched = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  return user;
}

private async revokeUserRefreshTokens(
  userId: string,
  tx: Prisma.TransactionClient
) {
  await tx.refreshToken.deleteMany({
    where: {
      userId,
    },
  });
}

private async getValidRefreshToken(token: string) {
  const payload = verifyRefreshToken(token);

  const refreshToken =
    await refreshTokenRepository.findByToken(token);

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

  return prisma.$transaction(async (tx) => {

    // 1. Create User
    const user = await userRepository.create(
      {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
      tx
    );

    // 2. Generate Tokens
    const {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    } = generateTokens(user.id, user.role);

    // 3. Save Refresh Token
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
      tx
    );

    // 4. Remove password
    const { passwordHash: _, ...safeUser } = user;

    // 5. TODO
    // publish USER_REGISTERED event

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  });
}

async loginUser(data: LoginDTO) {
  const user = await this.validateUserCredentials(
    data.email,
    data.password
  );

  return prisma.$transaction(async (tx) => {
    // Revoke old refresh tokens
    await this.revokeUserRefreshTokens(user.id, tx);

    // Generate new tokens
    const {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    } = generateTokens(user.id, user.role);

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
      tx
    );

    return {
      user: this.removePassword(user),
      accessToken,
      refreshToken,
    };
  });
}

async changePassword(
  userId: string,
  data: ChangePasswordDTO
) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const passwordMatched = await bcrypt.compare(
    data.oldPassword,
    user.passwordHash
  );

  if (!passwordMatched) {
    throw new AppError(401, "Invalid old password");
  }

  const passwordHash = await this.hashPassword(
    data.newPassword
  );

  await userRepository.update(userId, {
    passwordHash,
  });

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
      message:
        "If the email exists, a reset link has been sent.",
    };
  }

  // TODO
  // Generate reset token
  // Publish RabbitMQ event

  return {
    message:
      "If the email exists, a reset link has been sent.",
  };
}

async resetPassword(
  data: ResetPasswordDTO
) {
  try {
    const decoded = jwt.verify(
      data.token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
    };

    const passwordHash =
      await this.hashPassword(
        data.newPassword
      );

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

    return {
      message:
        "Password reset successfully",
    };

  } catch {
    throw new AppError(
      401,
      "Invalid or expired reset token"
    );
  }
}

async refreshToken(oldRefreshToken: string) {
  const { payload, refreshToken } =
    await this.getValidRefreshToken(oldRefreshToken);

  return prisma.$transaction(async (tx) => {

    // 1. Delete old refresh token
    await refreshTokenRepository.delete(
      refreshToken.id,
      tx
    );

    // 2. Get user
    const user = await userRepository.findById(
      payload.userId
    );

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
      tx
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
    };

    await userRepository.update(
      decoded.userId,
      {
        isActive: true,
      }
    );

    return {
      message:
        "Email verified successfully",
    };

  } catch {

    throw new AppError(
      400,
      "Invalid or expired verification token"
    );

  }
}

async logout(
  accessToken: string,
  refreshToken: string
) {
  const payload =
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!
    ) as {
      userId: string;
    };

  await prisma.$transaction(async (tx) => {

    await tx.refreshToken.deleteMany({
      where: {
        userId: payload.userId,
        token: refreshToken,
      },
    });

    const decoded =
      jwt.decode(accessToken) as {
        exp?: number;
      };

    if (decoded?.exp) {

      const ttl =
        decoded.exp -
        Math.floor(Date.now() / 1000);

      if (ttl > 0) {

        await redisClient.set(
          `bl_${accessToken}`,
          "true",
          "EX",
          ttl
        );

      }

    }

  });

  return {
    message:
      "Logged out successfully",
  };
}

}

export const authService = new AuthService();