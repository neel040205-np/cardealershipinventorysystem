import { User, Role } from "@prisma/client";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string; role: Role }): Promise<User>;
}
