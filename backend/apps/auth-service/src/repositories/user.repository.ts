import { Prisma, User, PrismaClient } from "@prisma/client";

import { prisma } from "../config/prisma.js";

export class UserRepository {

  async create(
    data: Prisma.UserCreateInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<User> {
    return tx.user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();