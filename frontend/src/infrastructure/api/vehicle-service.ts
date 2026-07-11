import { Vehicle } from "@core/entities/Vehicle";
import { axiosClient } from "./axios-client";

interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
}

// Vehicle API service layer
export const vehicleService = {
  async getAll(page?: number, limit?: number): Promise<VehicleListResponse> {
    const params: Record<string, number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await axiosClient.get("/vehicles", { params });
    return response.data.data;
  }
};
