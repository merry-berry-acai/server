const chalk = require('chalk');
const logger = require('./logger');

/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Log the error
    logger.error(`${err.message} - Stack: ${err.stack}`);

    // Respond to client
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        // Only send stack trace during development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    res.end(res.sentry + "/n");
};

/**
 * Wrapper for async route handlers to avoid try-catch repetition
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    ApiError,
    errorHandler,
    asyncHandler,
};
