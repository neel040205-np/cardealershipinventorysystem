import { describe, it, expect } from "vitest";
import { User } from "@domain/entities/User";
import { DomainException } from "@domain/exceptions/AppError";

describe("Domain: User Entity Invariants", () => {
  it("should successfully construct a valid User entity", () => {
    const user = User.create("valid@dealership.com", "Password123!", "SALES_REP");
    expect(user.email).toBe("valid@dealership.com");
    expect(user.role).toBe("SALES_REP");
  });

  it("should throw DomainException when email format is invalid", () => {
    expect(() => User.create("invalid-email", "Password123!", "SALES_REP")).toThrow(DomainException);
    expect(() => User.create("@dealership.com", "Password123!", "SALES_REP")).toThrow(DomainException);
    expect(() => User.create("test@", "Password123!", "SALES_REP")).toThrow(DomainException);
  });

  it("should throw DomainException when password is less than 8 characters", () => {
    expect(() => User.create("valid@dealership.com", "Short1!", "SALES_REP")).toThrow(DomainException);
  });
});
