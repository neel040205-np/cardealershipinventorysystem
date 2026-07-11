import { Vehicle as PrismaVehicle } from "@prisma/client";

export interface VehicleResponseDTO {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Mapper to format and standardize Vehicle database models to clean API response objects
export class VehicleMapper {
  public static toResponseDTO(vehicle: PrismaVehicle): VehicleResponseDTO {
    return {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: typeof vehicle.price === "object" ? Number(vehicle.price) : (vehicle.price as number),
      quantity: vehicle.quantity,
      createdAt: vehicle.createdAt ? vehicle.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: vehicle.updatedAt ? vehicle.updatedAt.toISOString() : new Date().toISOString()
    };
  }
}
