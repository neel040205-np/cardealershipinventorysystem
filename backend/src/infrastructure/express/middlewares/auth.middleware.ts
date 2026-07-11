import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@infra/config/environment";
import { UnauthorizedError } from "@domain/exceptions/AppError";

// Middleware to authenticate JWT access tokens on protected routes
export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check for missing header
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is missing.");
    }

    // 2. Validate Bearer scheme format
    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization header must use Bearer scheme.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Token is missing.");
    }

    // 3. Verify token signature and check expiration
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // 4. Attach authenticated user details to request object
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
