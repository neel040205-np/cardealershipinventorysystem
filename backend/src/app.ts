import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "@infra/config/environment";
import { errorHandler } from "@infra/express/middlewares/error.middleware";
import { NotFoundError } from "@domain/exceptions/AppError";

const app: Express = express();

// Apply Security Headers using Helmet
app.use(helmet());

// Enable Cross-Origin Resource Sharing with strict white-lists
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);

// Standard Payload Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express global rate-limiting middleware to guard endpoints against DDOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-6",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests from this IP. Please wait 15 minutes."
    }
  }
});
app.use(limiter);

// Health check endpoint for container orchestrators or monitor agents
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "UP",
      timestamp: new Date().toISOString()
    }
  });
});

// Catch-all route handler returning 404 for unmapped endpoints
app.use((_req, _res, next) => {
  next(new NotFoundError("The requested API route does not exist."));
});

// Centralized error recovery middleware
app.use(errorHandler);

export { app };
