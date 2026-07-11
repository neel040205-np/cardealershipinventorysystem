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
    },
    salesTransaction: {
      create: vi.fn()
    }
  }
}));

describe("API Integration: Purchase Vehicle (RED Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to sign user tokens
  const signToken = (role: "SALES_REP" | "ADMIN") => {
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

  const userToken = signToken("SALES_REP");

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

  // 1. Successful Purchase
  it("should allow an authenticated user to purchase a vehicle, decreasing quantity by 1", async () => {
    const mockUpdatedVehicle = {
      ...mockVehicle,
      quantity: 4
    };

    vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(mockVehicle as any);
    vi.mocked(prisma.vehicle.update).mockResolvedValue(mockUpdatedVehicle as any);
    vi.mocked(prisma.salesTransaction.create).mockResolvedValue({ id: "uuid-transaction-1" } as any);

    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/purchase")
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(4);
    expect(prisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: "uuid-vehicle-1" },
      data: { quantity: 4 }
    });
  });

  // 2. Out of Stock
  it("should return 400 Bad Request if the vehicle is out of stock", async () => {
    const outOfStockVehicle = {
      ...mockVehicle,
      quantity: 0
    };

    vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(outOfStockVehicle as any);

    const res = await request(app)
      .post("/api/vehicles/uuid-vehicle-1/purchase")
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("OUT_OF_STOCK");
  });

  // 3. Invalid Vehicle ID format
  it("should return 404 Not Found if the vehicle ID format is invalid", async () => {
    const res = await request(app)
      .post("/api/vehicles/bad-uuid-format/purchase")
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  // 4. Vehicle Not Found
  it("should return 404 Not Found if the vehicle does not exist", async () => {
    vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/vehicles/uuid-not-found/purchase")
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  // 5. Unauthorized Request (Missing Token)
  it("should return 401 Unauthorized if authorization credentials are missing", async () => {
    const res = await request(app).post("/api/vehicles/uuid-vehicle-1/purchase").send();

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 6. Concurrent Purchase Scenario
  it("should handle concurrency by preventing checkout when inventory is depleted", async () => {
    const singleStockVehicle = {
      ...mockVehicle,
      quantity: 1
    };

    // First request succeeds, second request finds quantity = 0 and throws out of stock error
    vi.mocked(prisma.vehicle.findUnique)
      .mockResolvedValueOnce(singleStockVehicle as any)
      .mockResolvedValueOnce({ ...singleStockVehicle, quantity: 0 } as any);

    vi.mocked(prisma.vehicle.update).mockResolvedValueOnce({ ...singleStockVehicle, quantity: 0 } as any);

    const [res1, res2] = await Promise.all([
      request(app).post("/api/vehicles/uuid-vehicle-1/purchase").set("Authorization", `Bearer ${userToken}`).send(),
      request(app).post("/api/vehicles/uuid-vehicle-1/purchase").set("Authorization", `Bearer ${userToken}`).send()
    ]);

    // One must succeed and one must fail
    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(400);
  });
});
