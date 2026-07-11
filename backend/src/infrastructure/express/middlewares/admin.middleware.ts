import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "@domain/exceptions/AppError";

// Middleware to restrict access to ADMIN users only
export const adminMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;

  if (!user) {
    throw new UnauthorizedError("Authentication is required to access this resource.");
  }

  if (user.role !== "ADMIN") {
    throw new ForbiddenError("You do not have permission to execute this operation.");
  }

  next();
};
