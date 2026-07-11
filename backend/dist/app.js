"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const environment_1 = require("@infra/config/environment");
const error_middleware_1 = require("@infra/express/middlewares/error.middleware");
const AppError_1 = require("@domain/exceptions/AppError");
const app = (0, express_1.default)();
exports.app = app;
// Apply Security Headers using Helmet
app.use((0, helmet_1.default)());
// Enable Cross-Origin Resource Sharing with strict white-lists
app.use((0, cors_1.default)({
    origin: environment_1.env.CORS_ORIGIN,
    credentials: true
}));
// Standard Payload Body Parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Express global rate-limiting middleware to guard endpoints against DDOS
const limiter = (0, express_rate_limit_1.rateLimit)({
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
// Mount root router under versioned path
const routes_1 = require("@infra/express/routes");
app.use("/api/v1", routes_1.rootRouter);
// Catch-all route handler returning 404 for unmapped endpoints
app.use((_req, _res, next) => {
    next(new AppError_1.NotFoundError("The requested API route does not exist."));
});
// Centralized error recovery middleware
app.use(error_middleware_1.errorHandler);
