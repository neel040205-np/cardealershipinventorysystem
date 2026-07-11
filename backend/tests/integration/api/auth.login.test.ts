import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { prisma } from "../../../src/infrastructure/database/prisma-client";
import bcrypt from "bcrypt";

// Mock the database client globally for isolation
vi.mock("@infra/database/prisma-client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

// Mock bcrypt hash comparison
vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn()
  }
}));

describe("API Integration: User Login (RED Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Successful Login
  it("should return 200 OK and return a JWT access token on successful credentials verification", async () => {
    const mockUser = {
      id: "uuid-4444",
      name: "Alice Smith",
      email: "alice@dealership.com",
      passwordHash: "bcrypt_hashed_value",
      role: "SALES_REP" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never); // Correct password comparison resolves to true

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "alice@dealership.com",
      password: "Password123!"
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined(); // Access Token
    expect(res.body.data.user.email).toBe("alice@dealership.com");
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Verify password hash is hidden
  });

  // 2. Wrong Password
  it("should return 401 Unauthorized if the password does not match", async () => {
    const mockUser = {
      id: "uuid-4444",
      name: "Alice Smith",
      email: "alice@dealership.com",
      passwordHash: "bcrypt_hashed_value",
      role: "SALES_REP" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never); // Wrong password returns false

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "alice@dealership.com",
      password: "WrongPassword"
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 3. Unknown Email
  it("should return 401 Unauthorized if the email is not registered", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // Unknown email returns null

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "unknown@dealership.com",
      password: "Password123!"
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 4. Missing Email
  it("should return 400 Bad Request if the email parameter is missing", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      password: "Password123!"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 5. Missing Password
  it("should return 400 Bad Request if the password parameter is missing", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "alice@dealership.com"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 6. Invalid Email format
  it("should return 400 Bad Request if the email format is invalid", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "invalid-email-format",
      password: "Password123!"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });
});
