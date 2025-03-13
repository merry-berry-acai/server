const Logger = require("../utils/logger");
const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");

// Define colors for different HTTP methods
const methodColors = {
    GET: chalk.green,
    POST: chalk.yellow,
    PUT: chalk.blue,
    PATCH: chalk.cyan,
    DELETE: chalk.red,
    OPTIONS: chalk.gray,
    HEAD: chalk.gray,
};

/**
 * Middleware to log HTTP requests and response times
 */
const requestLogger = (req, res, next) => {
    // Generate a unique request ID
    req.id = uuidv4();

    // Store request start time
    req.requestTime = Date.now();

    // Log incoming request
    Logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
        requestId: req.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        contentType: req.get("Content-Type"),
    });

    // Log request body in debug level (excluding sensitive data)
    if (req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = { ...req.body };

        // Remove sensitive fields before logging
        ["password", "token", "credit_card", "secret"].forEach((field) => {
            if (sanitizedBody[field]) sanitizedBody[field] = "[REDACTED]";
        });

        Logger.debug(`Request payload`, {
            requestId: req.id,
            body: sanitizedBody,
        });
    }

    // Log response when it's sent
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - req.requestTime;
        const userId = req.userId || req.firebaseUid || "guest";

        // Log completion with response time
        Logger.request(
            req.method,
            req.originalUrl,
            res.statusCode,
            userId,
            responseTime
        );

        // Log response body for debugging (for non-production environments)
        if (process.env.NODE_ENV !== "production" && body) {
            try {
                const parsedBody = typeof body === "object" ? body : JSON.parse(body);
                Logger.debug(`Response payload for ${req.id}`, {
                    requestId: req.id,
                    responseSize: body.length || "unknown",
                    responseType: typeof parsedBody,
                });
            } catch (e) {
                // If parsing fails, it's likely not JSON
                Logger.debug(`Non-JSON response for ${req.id}`, {
                    requestId: req.id,
                    responseSize: body.length || "unknown",
                });
            }
        }

        return originalSend.apply(res, arguments);
    };

    next();
};

module.exports = requestLogger;
