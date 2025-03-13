const Logger = require("../utils/logger");
const { sendError } = require("../utils/responseHandler");

/**
 * Express error handling middleware
 * Should be added after all routes
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || "SERVER_ERROR";
    const message = err.message || "An unexpected error occurred";

    // Log different error types differently
    if (statusCode >= 500) {
        Logger.error(`Server error occurred`, err, {
            requestId: req.id,
            path: req.originalUrl,
            method: req.method,
            statusCode,
            errorCode,
        });
    } else if (statusCode >= 400) {
        Logger.warn(`Client error: ${message}`, {
            requestId: req.id,
            path: req.originalUrl,
            statusCode,
            errorCode,
            userId: req.userId || req.firebaseUid || "unknown",
        });
    }

    // Create error details based on error type
    let errorDetails = null;

    if (err.name === "ValidationError") {
        // Mongoose validation error
        errorDetails = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
            value: e.value,
        }));
    } else if (err.name === "MongoError" && err.code === 11000) {
        // MongoDB duplicate key error
        errorDetails = {
            type: "DuplicateKey",
            field: Object.keys(err.keyValue)[0],
            value: Object.values(err.keyValue)[0],
        };
    } else if (process.env.NODE_ENV !== "production") {
        // Include stack trace in development
        errorDetails = {
            stack: err.stack,
        };
    }

    // Send the formatted error response
    return sendError(res, message, statusCode, errorDetails, errorCode);
};

/**
 * Custom error class with status code and error code
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.name = "AppError";
    }
}

/**
 * 404 Not Found middleware for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    Logger.warn(`Route not found: ${req.originalUrl}`, {
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });

    sendError(
        res,
        `Route not found: ${req.originalUrl}`,
        404,
        null,
        "ROUTE_NOT_FOUND"
    );
};

module.exports = {
    errorHandler,
    AppError,
    notFoundHandler,
};
