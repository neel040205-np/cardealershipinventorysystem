import { Vehicle as PrismaVehicle } from "@prisma/client";
import { IVehicleRepository } from "../ports/IVehicleRepository";

export class SearchVehicles {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(filters: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ vehicles: PrismaVehicle[] }> {
    const vehicles = await this.vehicleRepo.search(filters);
    return { vehicles };
  }
}
