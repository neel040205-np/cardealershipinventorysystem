import { Vehicle as PrismaVehicle } from "@prisma/client";
import { IVehicleRepository } from "../ports/IVehicleRepository";
import { NotFoundError } from "@domain/exceptions/AppError";

export class DeleteVehicle {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<PrismaVehicle> {
    // 1. Verify existence
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Vehicle not found.");
    }

    // 2. Perform delete
    return this.vehicleRepo.delete(id);
  }
}
