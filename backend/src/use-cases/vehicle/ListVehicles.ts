import { Vehicle as PrismaVehicle } from "@prisma/client";
import { IVehicleRepository } from "../ports/IVehicleRepository";

export class ListVehicles {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(options: { page?: number; limit?: number }): Promise<{ vehicles: PrismaVehicle[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      this.vehicleRepo.findAll({ skip, take: limit }),
      this.vehicleRepo.countAll()
    ]);

    return { vehicles, total };
  }
}
