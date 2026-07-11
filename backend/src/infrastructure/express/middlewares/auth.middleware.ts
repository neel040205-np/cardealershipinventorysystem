import { Request, Response, NextFunction } from "express";
import { tokenService } from "@infra/di/container";
import { extractBearerToken } from "../utils/token";
import { UnauthorizedError } from "@domain/exceptions/AppError";

// Middleware to authenticate JWT access tokens on protected routes
export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // 1. Extract token using helper utility
    const token = extractBearerToken(req);

    // 2. Verify token using singleton TokenService port instance
    const decoded = tokenService.verify(token);

    // 3. Attach authenticated user details to request object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError("Token is invalid or has expired."));
    }
  }
};
