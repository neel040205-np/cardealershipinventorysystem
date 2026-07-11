import { Role } from "@prisma/client";

export interface RegisterUserDTO {
  email: string;
  password: string;
  role: Role;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
}
