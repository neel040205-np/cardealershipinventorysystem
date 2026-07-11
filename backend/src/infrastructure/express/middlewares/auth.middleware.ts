import { Request, Response, NextFunction } from "express";

// Middleware skeleton stub that does not verify JWTs.
// This allows integration tests to run and verify RED assertion failures.
export const authMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
