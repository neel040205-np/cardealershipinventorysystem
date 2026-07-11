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
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    }
  }
}));

describe("API Integration: Vehicle CRUD (RED Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to sign test tokens
  const signToken = (role: "ADMIN" | "USER" | "SALES_REP") => {
    return jwt.sign(
      {
        userId: "uuid-admin-user",
        email: `${role.toLowerCase()}@dealership.com`,
        role
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );
  };

  const adminToken = signToken("ADMIN");
  const userToken = signToken("USER");

  const validVehiclePayload = {
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 25000.0,
    quantity: 5
  };

  describe("POST /api/vehicles (Create)", () => {
    it("should allow an ADMIN to create a new vehicle", async () => {
      const mockCreatedVehicle = {
        id: "uuid-vehicle-1",
        ...validVehiclePayload,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.vehicle.create).mockResolvedValue(mockCreatedVehicle);

      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validVehiclePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicle.id).toBe("uuid-vehicle-1");
      expect(res.body.data.vehicle.make).toBe("Toyota");
    });

    it("should block a normal USER from creating a vehicle and return 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validVehiclePayload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should return 400 Bad Request on missing required fields", async () => {
      const res = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${adminToken}`).send({
        make: "Toyota"
        // Missing model, category, price, quantity
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_FAILED");
    });

    it("should return 400 Bad Request on invalid price (zero or negative)", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validVehiclePayload,
          price: -100.0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_FAILED");
    });

    it("should return 400 Bad Request on invalid quantity (negative value)", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validVehiclePayload,
          quantity: -1
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_FAILED");
    });
  });

  describe("GET /api/vehicles (List & Pagination)", () => {
    it("should return a list of vehicles", async () => {
      const mockVehicles = [
        { id: "v1", make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 },
        { id: "v2", make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 3 }
      ];

      vi.mocked(prisma.vehicle.findMany).mockResolvedValue(mockVehicles as any);
      vi.mocked(prisma.vehicle.count).mockResolvedValue(2);

      const res = await request(app).get("/api/vehicles");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it("should return an empty list if no vehicles exist", async () => {
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue([]);
      vi.mocked(prisma.vehicle.count).mockResolvedValue(0);

      const res = await request(app).get("/api/vehicles");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
    });
  });

  describe("GET /api/vehicles/search (Filters)", () => {
    it("should search vehicles by make", async () => {
      const mockVehicles = [{ id: "v1", make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 }];
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue(mockVehicles as any);

      const res = await request(app).get("/api/vehicles/search?make=Toyota");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(1);
    });

    it("should search vehicles by model", async () => {
      const mockVehicles = [{ id: "v1", make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 }];
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue(mockVehicles as any);

      const res = await request(app).get("/api/vehicles/search?model=Camry");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(1);
    });

    it("should search vehicles by category", async () => {
      const mockVehicles = [{ id: "v1", make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 }];
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue(mockVehicles as any);

      const res = await request(app).get("/api/vehicles/search?category=Sedan");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(1);
    });

    it("should search vehicles by price range", async () => {
      const mockVehicles = [{ id: "v1", make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 }];
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue(mockVehicles as any);

      const res = await request(app).get("/api/vehicles/search?minPrice=20000&maxPrice=30000");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(1);
    });

    it("should return an empty list if no search results match", async () => {
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue([]);

      const res = await request(app).get("/api/vehicles/search?make=Porsche");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toHaveLength(0);
    });
  });

  describe("PUT /api/vehicles/:id (Update)", () => {
    it("should allow an ADMIN to update a vehicle", async () => {
      const existingVehicle = {
        id: "uuid-v1",
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000.0,
        quantity: 5
      };

      const mockUpdatedVehicle = {
        ...existingVehicle,
        price: 26000.0
      };

      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(existingVehicle as any);
      vi.mocked(prisma.vehicle.update).mockResolvedValue(mockUpdatedVehicle as any);

      const res = await request(app)
        .put("/api/vehicles/uuid-v1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: 26000.0 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicle.price).toBe(26000.0);
    });

    it("should block a normal USER from updating a vehicle and return 403 Forbidden", async () => {
      const res = await request(app)
        .put("/api/vehicles/uuid-v1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 26000.0 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should return 404 Not Found if the vehicle to update does not exist", async () => {
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/vehicles/uuid-v1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: 26000.0 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 400 Bad Request on invalid update data", async () => {
      const res = await request(app)
        .put("/api/vehicles/uuid-v1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: -10.0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_FAILED");
    });
  });

  describe("DELETE /api/vehicles/:id (Delete)", () => {
    it("should allow an ADMIN to delete a vehicle", async () => {
      const existingVehicle = {
        id: "uuid-v1",
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000.0,
        quantity: 5
      };

      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(existingVehicle as any);
      vi.mocked(prisma.vehicle.delete).mockResolvedValue(existingVehicle as any);

      const res = await request(app).delete("/api/vehicles/uuid-v1").set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should block a normal USER from deleting a vehicle and return 403 Forbidden", async () => {
      const res = await request(app).delete("/api/vehicles/uuid-v1").set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should return 404 Not Found if the vehicle to delete does not exist", async () => {
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(null);

      const res = await request(app).delete("/api/vehicles/uuid-v1").set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
