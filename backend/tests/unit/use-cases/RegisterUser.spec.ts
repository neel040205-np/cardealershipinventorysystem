import { describe, it, expect, vi } from "vitest";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { InMemoryUserRepository } from "../../mocks/InMemoryUserRepository";
import { ConflictError } from "@domain/exceptions/AppError";

const mockHashService = {
  hash: vi.fn().mockImplementation(async (pass: string) => `hashed_${pass}`),
  compare: vi.fn()
};

describe("Use Case: RegisterUser Interactor", () => {
  it("should securely hash password and save user profile", async () => {
    const userRepo = new InMemoryUserRepository();
    const useCase = new RegisterUser(userRepo, mockHashService);

    const result = await useCase.execute({
      email: "new.rep@dealership.com",
      password: "Password123!",
      role: "SALES_REP"
    });

    expect(mockHashService.hash).toHaveBeenCalledWith("Password123!");
    expect(result.email).toBe("new.rep@dealership.com");
    expect(result.passwordHash).toBe("hashed_Password123!");
    expect(result.role).toBe("SALES_REP");
    expect(result.id).toBeDefined();
  });

  it("should throw ConflictError if email is already taken", async () => {
    const userRepo = new InMemoryUserRepository();
    await userRepo.create({
      email: "duplicate@dealership.com",
      passwordHash: "hashed_pwd",
      role: "SALES_REP"
    });

    const useCase = new RegisterUser(userRepo, mockHashService);

    await expect(
      useCase.execute({
        email: "duplicate@dealership.com",
        password: "Password123!",
        role: "SALES_REP"
      })
    ).rejects.toThrow(ConflictError);
  });
});
