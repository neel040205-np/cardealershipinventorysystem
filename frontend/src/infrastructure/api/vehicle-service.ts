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
  },

  async purchase(id: string): Promise<Vehicle> {
    const response = await axiosClient.post(`/vehicles/${id}/purchase`);
    return response.data.data.vehicle;
  },

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const response = await axiosClient.post("/vehicles", data);
    return response.data.data.vehicle;
  },

  async update(id: string, data: Partial<CreateVehicleData>): Promise<Vehicle> {
    const response = await axiosClient.put(`/vehicles/${id}`, data);
    return response.data.data.vehicle;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/vehicles/${id}`);
  },

  async restock(id: string, quantity: number): Promise<Vehicle> {
    const response = await axiosClient.post(`/vehicles/${id}/restock`, { quantity });
    return response.data.data.vehicle;
  }
};

export interface CreateVehicleData {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}
