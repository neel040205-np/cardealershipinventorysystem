import { User, Role } from "@prisma/client";
import { IUserRepository } from "@usecases/ports/IUserRepository";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async create(data: { name: string; email: string; passwordHash: string; role: Role }): Promise<User> {
    const newUser: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
}
