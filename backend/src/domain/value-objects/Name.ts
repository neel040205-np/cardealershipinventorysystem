import { DomainException } from "@domain/exceptions/AppError";

// Name Value Object representing a validated, normalized user name invariant
export class Name {
  private constructor(public readonly value: string) {}

  public static create(name: string): Name {
    if (!name || name.trim().length === 0) {
      throw new DomainException("Name is required.");
    }
    // Trim and normalize multiple consecutive spaces to a single space
    const normalized = name.trim().replace(/\s+/g, " ");
    return new Name(normalized);
  }
}
