import { User } from "@core/entities/User";

export interface LoginResponse {
  token: string;
  user: User;
}

// Authentication operations interface port
export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>;
  register(name: string, email: string, password: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;
}
