import { Role } from "@prisma/client";
import { DomainException } from "@domain/exceptions/AppError";
import { Email } from "../value-objects/Email";
import { Name } from "../value-objects/Name";

// User Domain Entity Enforcing Domain Invariants
export class User {
  private constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  // Static Factory Method for Creating a New User (with validation)
  public static create(name: string, email: string, passwordPlain: string, role: Role, id?: string): User {
    // 1. Validate name syntax using the Name value object
    const validatedName = Name.create(name);

    // 2. Validate email syntax using the Email value object
    const validatedEmail = Email.create(email);

    // 3. Password length invariant check
    if (passwordPlain.length < 8) {
      throw new DomainException("Password must be at least 8 characters long.");
    }

    // 4. Role validation check
    const validRoles: Role[] = ["ADMIN", "MANAGER", "SALES_REP"];
    if (!validRoles.includes(role)) {
      throw new DomainException("Invalid user role specified.");
    }

    return new User(validatedName.value, validatedEmail.value, "", role, id);
  }

  // Static Factory Method for Reconstructing User from Database Records
  public static reconstruct(
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    role: Role,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(name, email, passwordHash, role, id, createdAt, updatedAt);
  }
}
