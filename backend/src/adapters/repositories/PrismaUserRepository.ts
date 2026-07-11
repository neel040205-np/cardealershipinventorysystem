import { User, Role } from "@prisma/client";
import { IUserRepository } from "@usecases/ports/IUserRepository";
import { prisma } from "@infra/database/prisma-client";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async create(data: { email: string; passwordHash: string; role: Role }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role
      }
    });
  }
}
