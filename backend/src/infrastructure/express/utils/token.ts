import { Request } from "express";
import { UnauthorizedError } from "@domain/exceptions/AppError";

// Helper utility to parse and extract Bearer JWT tokens from headers
export const extractBearerToken = (req: Request): string => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Authorization header is missing.");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authorization header must use Bearer scheme.");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Token is missing.");
  }

  return token;
};
