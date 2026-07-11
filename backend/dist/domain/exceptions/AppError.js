"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainException = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    message;
    statusCode;
    code;
    details;
    isOperational = true;
    constructor(message, statusCode, code, details = null) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, "VALIDATION_FAILED", details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = "Authentication credentials missing or invalid.") {
        super(message, 401, "UNAUTHORIZED");
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "You do not have permission to execute this operation.") {
        super(message, 403, "FORBIDDEN");
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = "The requested resource was not found.") {
        super(message, 404, "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, "CONFLICT");
    }
}
exports.ConflictError = ConflictError;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = "DomainException";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.DomainException = DomainException;
