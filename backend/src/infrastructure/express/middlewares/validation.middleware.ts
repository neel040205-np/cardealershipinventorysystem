import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "@domain/exceptions/AppError";

// Global Middleware to validate incoming request data using Zod Schemas
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.slice(1).join("."), // removes 'body', 'query', or 'params' prefix from path
          message: err.message
        }));
        next(new ValidationError("Request validation failed", details));
        return;
      }
      next(error);
    }
  };
};
