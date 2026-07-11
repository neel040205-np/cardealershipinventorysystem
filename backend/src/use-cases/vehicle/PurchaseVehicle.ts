import { Vehicle as PrismaVehicle } from "@prisma/client";
import { IVehicleRepository } from "../ports/IVehicleRepository";

export class PurchaseVehicle {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<PrismaVehicle> {
    // Delegate to repository transaction purchase methods
    return this.vehicleRepo.purchase(id);
  }
}
