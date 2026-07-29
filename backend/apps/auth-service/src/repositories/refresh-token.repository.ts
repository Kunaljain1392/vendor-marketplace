import { Prisma, PrismaClient, RefreshToken } from "@prisma/client";

import { prisma } from "../config/prisma.js";

export class RefreshTokenRepository {
  async create(
    data: Prisma.RefreshTokenCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<RefreshToken> {
    return tx.refreshToken.create({
      data,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: {
        token,
      },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: {
        token,
      },
    });
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  async delete(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.refreshToken.delete({
      where: {
        id,
      },
    });
  }

  async deleteByUserAndToken(
  userId: string,
  token: string,
  tx: Prisma.TransactionClient = prisma
): Promise<void> {
  await tx.refreshToken.deleteMany({
    where: {
      userId,
      token,
    },
  });
}

}

export const refreshTokenRepository = new RefreshTokenRepository();
