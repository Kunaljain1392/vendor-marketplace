
import { Prisma, User, PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export class UserRepository {
  /**
   * Creates a new user in the database.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Finds a user by their email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Finds a user by their UUID.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

}

export const userRepository = new UserRepository();