import { Response } from "express";

// Sends a standardized JSend success JSON response envelope
export const sendSuccessResponse = (res: Response, statusCode: number, data: unknown): void => {
  res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};
