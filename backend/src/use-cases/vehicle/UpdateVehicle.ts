import { Vehicle as PrismaVehicle } from "@prisma/client";
import { Vehicle as VehicleDomain } from "@domain/entities/Vehicle";
import { IVehicleRepository } from "../ports/IVehicleRepository";
import { NotFoundError } from "@domain/exceptions/AppError";

export class UpdateVehicle {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(
    id: string,
    data: Partial<{ make: string; model: string; category: string; price: number; quantity: number }>
  ): Promise<PrismaVehicle> {
    // 1. Verify existence
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Vehicle not found.");
    }

    // 2. Apply domain validation on resulting state
    const merged = {
      make: data.make !== undefined ? data.make : existing.make,
      model: data.model !== undefined ? data.model : existing.model,
      category: data.category !== undefined ? data.category : existing.category,
      price: data.price !== undefined ? data.price : Number(existing.price),
      quantity: data.quantity !== undefined ? data.quantity : existing.quantity
    };

    VehicleDomain.create(merged.make, merged.model, merged.category, merged.price, merged.quantity);

    // 3. Save updates
    return this.vehicleRepo.update(id, data);
  }
}
