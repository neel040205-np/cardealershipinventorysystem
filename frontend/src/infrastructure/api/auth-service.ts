import { IAuthService, LoginResponse } from "@core/ports/IAuthService";
import { User } from "@core/entities/User";
import { axiosClient } from "./axios-client";

// Concrete implementation of Auth Service calling the backend API endpoints
export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axiosClient.post("/v1/auth/login", { email, password });
    return response.data.data;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const response = await axiosClient.post("/v1/auth/register", { name, email, password });
    return response.data.data.user;
  }

  async getCurrentUser(): Promise<User | null> {
    return null;
  }
}

export const authService = new AuthService();
