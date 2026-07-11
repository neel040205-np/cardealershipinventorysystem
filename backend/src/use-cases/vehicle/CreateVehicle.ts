import { Vehicle as PrismaVehicle } from "@prisma/client";
import { Vehicle as VehicleDomain } from "@domain/entities/Vehicle";
import { IVehicleRepository } from "../ports/IVehicleRepository";

export class CreateVehicle {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(dto: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }): Promise<PrismaVehicle> {
    // 1. Enforce domain validations
    VehicleDomain.create(dto.make, dto.model, dto.category, dto.price, dto.quantity);

    // 2. Persist new inventory record
    return this.vehicleRepo.create(dto);
  }
}
