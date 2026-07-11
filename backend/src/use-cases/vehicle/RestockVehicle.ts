import { Vehicle as PrismaVehicle } from "@prisma/client";
import { IVehicleRepository } from "../ports/IVehicleRepository";
import { NotFoundError } from "@domain/exceptions/AppError";

export class RestockVehicle {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(id: string, quantity: number): Promise<PrismaVehicle> {
    // 1. Fetch current vehicle
    const vehicle = await this.vehicleRepo.findById(id);

    if (!vehicle) {
      throw new NotFoundError("Vehicle not found.");
    }

    // 2. Perform additions logic
    const newQuantity = vehicle.quantity + quantity;

    // 3. Save new inventory totals
    return this.vehicleRepo.update(id, { quantity: newQuantity });
  }
}
