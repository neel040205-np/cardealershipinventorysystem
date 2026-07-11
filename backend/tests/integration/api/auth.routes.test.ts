import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { prisma } from "../../../src/infrastructure/database/prisma-client";

// Mock the prisma client connection globally for API route testing in isolation
vi.mock("@infra/database/prisma-client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}));

describe("API Integration: Auth Registration Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a new user successfully via POST /api/v1/auth/register", async () => {
    const mockPrismaUser = {
      id: "uuid-1234",
      email: "new.user@dealership.com",
      passwordHash: "bcrypt_hashed_pass",
      role: "SALES_REP" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockPrismaUser);

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "new.user@dealership.com",
        password: "Password123!",
        role: "SALES_REP"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("new.user@dealership.com");
    expect(res.body.data.user.role).toBe("SALES_REP");
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Verify password hash is excluded from responses
  });

  it("should return 400 Bad Request if the request payload fails Zod validations", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "invalid-email",
        password: "short",
        role: "SALES_REP"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });
});
