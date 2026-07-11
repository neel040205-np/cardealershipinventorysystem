"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const AppError_1 = require("@domain/exceptions/AppError");
// Global Middleware to validate incoming request data using Zod Schemas
const validateRequest = (schema) => {
    return async (req, _res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.slice(1).join("."), // removes 'body', 'query', or 'params' prefix from path
                    message: err.message
                }));
                next(new AppError_1.ValidationError("Request validation failed", details));
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
