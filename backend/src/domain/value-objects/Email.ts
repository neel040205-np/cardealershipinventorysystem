import { DomainException } from "@domain/exceptions/AppError";

// Email Value Object representing a validated email address invariant
export class Email {
  private constructor(public readonly value: string) {}

  public static create(email: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainException("Invalid email address format.");
    }
    return new Email(email.toLowerCase().trim());
  }
}
