import { Request, Response, NextFunction } from "express";
import { AppError } from "@domain/exceptions/AppError";
import { logger } from "@infra/logging/winston";

// Global Express Error-Handling Middleware
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const timestamp = new Date().toISOString();

  // Handle Express JSON parsing syntax errors (e.g. malformed JSON payloads)
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    logger.warn("Operational Error: 400 - BAD_REQUEST - Malformed JSON payload", {
      path: req.path,
      method: req.method
    });

    res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "Malformed JSON payload."
      },
      meta: {
        timestamp
      }
    });
    return;
  }

  // If the error is an instance of our operational AppError
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.statusCode} - ${err.code} - ${err.message}`, {
      path: req.path,
      method: req.method
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {})
      },
      meta: {
        timestamp
      }
    });
    return;
  }

  // Unhandled Programmer/System Errors
  logger.error("Unhandled Application Exception:", err);

  res.status(500).json({
    success: false,
    error: {
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected internal error occurred on the server."
    },
    meta: {
      timestamp
    }
  });
};
