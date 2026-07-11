import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { prisma } from "../../../src/infrastructure/database/prisma-client";

// Mock the prisma client globally for database isolation
vi.mock("@infra/database/prisma-client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}));

describe("API Integration: User Registration (RED Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Successful registration
  it("should return 201 Created and return user data (without password hash) on successful registration", async () => {
    const mockCreatedUser = {
      id: "uuid-9999",
      name: "John Doe",
      email: "john.doe@dealership.com",
      passwordHash: "bcrypt_hashed_value",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser);

    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john.doe@dealership.com",
      password: "Password123!"
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBeDefined();
    expect(res.body.data.user.name).toBe("John Doe");
    expect(res.body.data.user.email).toBe("john.doe@dealership.com");
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Should never leak password hash
  });

  // 2. Duplicate email
  it("should return 409 Conflict if email is already taken", async () => {
    const existingUser = {
      id: "uuid-1111",
      name: "Existing User",
      email: "john.doe@dealership.com",
      passwordHash: "hashed_pass",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john.doe@dealership.com",
      password: "Password123!"
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  // 3. Invalid email
  it("should return 400 Bad Request if the email format is invalid", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "invalid-email-format",
      password: "Password123!"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 4. Missing email
  it("should return 400 Bad Request if email parameter is missing", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      password: "Password123!"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 5. Missing password
  it("should return 400 Bad Request if password parameter is missing", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john.doe@dealership.com"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 6. Missing name
  it("should return 400 Bad Request if name parameter is missing", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "john.doe@dealership.com",
      password: "Password123!"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 7. Weak password
  it("should return 400 Bad Request if password is less than 8 characters", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john.doe@dealership.com",
      password: "Short1!"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 8. Malformed JSON
  it("should return 400 Bad Request on malformed JSON payload", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("Content-Type", "application/json")
      .send("{\"name\": \"John Doe\", \"email\": \"john@dealership.com\", \"password\": ");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 9. Unexpected fields
  it("should return 400 Bad Request if request body contains unexpected fields", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "John Doe",
      email: "john.doe@dealership.com",
      password: "Password123!",
      extraField: "hackyValue"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });
});
