import { Role } from "@prisma/client";
import { DomainException } from "@domain/exceptions/AppError";

// User Domain Entity Enforcing Domain Invariants
export class User {
  private constructor(
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  // Static Factory Method for Creating a New User (with validation)
  public static create(email: string, passwordPlain: string, role: Role, id?: string): User {
    // 1. Email format invariant check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainException("Invalid email address format.");
    }

    // 2. Password length invariant check
    if (passwordPlain.length < 8) {
      throw new DomainException("Password must be at least 8 characters long.");
    }

    // 3. Role validation check
    const validRoles: Role[] = ["ADMIN", "MANAGER", "SALES_REP"];
    if (!validRoles.includes(role)) {
      throw new DomainException("Invalid user role specified.");
    }

    // We initialize passwordHash as empty; it will be filled by the hash service in the use-case layer.
    return new User(email, "", role, id);
  }

  // Static Factory Method for Reconstructing User from Database Records (bypassing domain validation checks)
  public static reconstruct(
    id: string,
    email: string,
    passwordHash: string,
    role: Role,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(email, passwordHash, role, id, createdAt, updatedAt);
  }
}
