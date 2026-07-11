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
  },

  async search(filters: SearchFilters): Promise<VehicleListResponse> {
    const params: Record<string, string | number> = {};
    if (filters.make) params.make = filters.make;
    if (filters.model) params.model = filters.model;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice !== undefined && filters.minPrice !== null) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.maxPrice = filters.maxPrice;

    const response = await axiosClient.get("/vehicles/search", { params });
    return { vehicles: response.data.data.vehicles, total: response.data.data.vehicles.length };
  }
};

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}
