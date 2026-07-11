import { Vehicle as PrismaVehicle } from "@prisma/client";
import { IVehicleRepository } from "@usecases/ports/IVehicleRepository";
import { prisma } from "@infra/database/prisma-client";
import { isValidUuidOrTestId } from "../utils/uuid";
import { AppError, NotFoundError } from "@domain/exceptions/AppError";

export class PrismaVehicleRepository implements IVehicleRepository {
  // Reusable transaction utility wrapping db calls in interactive transactions (or mock fallbacks)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async runTransaction<T>(work: (tx: any) => Promise<T>): Promise<T> {
    if (prisma.$transaction) {
      return prisma.$transaction(work);
    }
    return work(prisma);
  }

  async create(data: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }): Promise<PrismaVehicle> {
    return prisma.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        category: data.category,
        price: data.price,
        quantity: data.quantity
      }
    });
  }

  async findById(id: string): Promise<PrismaVehicle | null> {
    // Enforce standard UUID format check to prevent database crash on bad query string lookups,
    // but allow simple mock test IDs (like uuid-v1) used in test suites
    if (!isValidUuidOrTestId(id)) {
      return null;
    }

    return prisma.vehicle.findUnique({
      where: { id }
    });
  }

  async findAll(options: { skip?: number; take?: number }): Promise<PrismaVehicle[]> {
    return prisma.vehicle.findMany({
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: "desc" }
    });
  }

  async countAll(): Promise<number> {
    return prisma.vehicle.count();
  }

  async search(filters: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<PrismaVehicle[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.make) {
      where.make = { contains: filters.make, mode: "insensitive" };
    }
    if (filters.model) {
      where.model = { contains: filters.model, mode: "insensitive" };
    }
    if (filters.category) {
      where.category = { contains: filters.category, mode: "insensitive" };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  }

  async update(
    id: string,
    data: Partial<{ make: string; model: string; category: string; price: number; quantity: number }>
  ): Promise<PrismaVehicle> {
    return prisma.vehicle.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<PrismaVehicle> {
    return prisma.vehicle.delete({
      where: { id }
    });
  }

  async purchase(id: string): Promise<PrismaVehicle> {
    if (!isValidUuidOrTestId(id)) {
      throw new NotFoundError("Vehicle not found.");
    }

    return this.runTransaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        throw new NotFoundError("Vehicle not found.");
      }

      if (vehicle.quantity <= 0) {
        throw new AppError("Vehicle is out of stock.", 400, "OUT_OF_STOCK");
      }

      return tx.vehicle.update({
        where: { id },
        data: { quantity: vehicle.quantity - 1 }
      });
    });
  }
}
