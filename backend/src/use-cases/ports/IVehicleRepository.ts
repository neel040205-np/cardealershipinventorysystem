import { Vehicle as PrismaVehicle } from "@prisma/client";

export interface IVehicleRepository {
  create(data: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }): Promise<PrismaVehicle>;
  findById(id: string): Promise<PrismaVehicle | null>;
  findAll(options: { skip?: number; take?: number }): Promise<PrismaVehicle[]>;
  countAll(): Promise<number>;
  search(filters: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<PrismaVehicle[]>;
  update(
    id: string,
    data: Partial<{ make: string; model: string; category: string; price: number; quantity: number }>
  ): Promise<PrismaVehicle>;
  delete(id: string): Promise<PrismaVehicle>;
}
