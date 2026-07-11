/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../../src/app";
import { env } from "../../../src/infrastructure/config/environment";
import { prisma } from "../../../src/infrastructure/database/prisma-client";

// Mock Prisma Client
vi.mock("@infra/database/prisma-client", () => ({
  prisma: {
    vehicle: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe("API Integration: Restock Vehicle (RED Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to sign user tokens
  const signToken = (role: "ADMIN" | "USER" | "SALES_REP") => {
    return jwt.sign(
      {
        userId: "uuid-test-user",
        email: "user@dealership.com",
        role
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );
  };

  const adminToken = signToken("ADMIN");
  const userToken = signToken("USER");

  const mockVehicle = {
    id: "uuid-vehicle-1",
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 25000.0,
    quantity: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 1. Successful Restock
  it("should allow an ADMIN to restock a vehicle, increasing its quantity", async () => {
    const mockUpdatedVehicle = {
      ...mockVehicle,
      quantity: 15
    };

    vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(mockVehicle as any);
    vi.mocked(prisma.vehicle.update).mockResolvedValue(mockUpdatedVehicle as any);

    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(15);
    expect(prisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: "uuid-vehicle-1" },
      data: { quantity: 15 }
    });
  });

  // 2. Unauthorized User (Missing Token)
  it("should return 401 Unauthorized if authorization credentials are missing", async () => {
    const res = await request(app).post("/api/vehicles/uuid-vehicle-1/restock").send({ quantity: 10 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 3. Non-admin User (Forbidden)
  it("should block a normal USER from restocking and return 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/restock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  // 4. Vehicle Not Found
  it("should return 404 Not Found if the vehicle does not exist", async () => {
    vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/vehicles/uuid-not-found/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  // 5. Invalid Quantity (Negative, Zero, or Missing)
  it("should return 400 Bad Request if quantity is negative", async () => {
    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("should return 400 Bad Request if quantity is zero", async () => {
    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("should return 400 Bad Request if quantity is missing", async () => {
    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  // 6. Invalid Vehicle ID format
  it("should return 404 Not Found if the vehicle ID format is invalid", async () => {
    const res = await request(app)
      .post("/api/vehicles/bad-uuid-format/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
