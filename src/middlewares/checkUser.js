const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");
const Logger = require("../utils/logger");
const { sendError } = require("../utils/responseHandler");

/**
 * Middleware to extract Firebase UID without verification.
 * Attaches `req.firebaseUid = uid` for later use.
 */
const checkUserFirebaseUid = async (req, res, next) => {
    try {
        const requestPath = req.originalUrl;
        const requestId = req.id || Math.random().toString(36).substring(2, 10);

        // Get Authorization header - if no authentication, continue as guest
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            Logger.warn(`No auth token provided for ${requestPath}`, {
                requestId,
                path: requestPath,
                method: req.method,
                ip: req.ip,
            });
            req.firebaseUid = null;
            req.authStatus = "guest";
            next();
            return;
        }

        // Extract token from "Bearer <token>"
        const idToken = authHeader.split(" ")[1];

        // Log token processing attempt
        Logger.debug(`Processing authentication token`, {
            requestId,
            tokenLength: idToken.length,
        });

        // Decode the token without verifying
        const decodedToken = jwt.decode(idToken);

        // Detailed token validation checks
        if (!decodedToken) {
            Logger.error(`Malformed JWT token`, null, {
                requestId,
                path: requestPath,
            });
            return sendError(
                res,
                "Invalid authentication token format",
                401,
                null,
                "AUTH_INVALID_TOKEN_FORMAT"
            );
        }

        if (!decodedToken.user_id) {
            Logger.error(`JWT token missing user_id field`, null, {
                requestId,
                path: requestPath,
                tokenFields: Object.keys(decodedToken),
            });
            return sendError(
                res,
                "Invalid token: missing user identifier",
                401,
                null,
                "AUTH_MISSING_USER_ID"
            );
        }

        // Check token expiration if exp claim exists
        if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
            Logger.warn(`Expired token detected`, {
                requestId,
                expiry: new Date(decodedToken.exp * 1000).toISOString(),
                userId: decodedToken.user_id,
            });
            return sendError(
                res,
                "Authentication token has expired",
                401,
                null,
                "AUTH_TOKEN_EXPIRED"
            );
        }

        // Extract UID from the decoded token
        const uid = decodedToken.user_id;

        Logger.info(`Authenticated request from user`, {
            requestId,
            uid,
            email: decodedToken.email || "not provided",
            path: requestPath,
        });

        // Attach the Firebase UID to the request
        req.firebaseUid = uid;
        req.authStatus = "authenticated";
        req.decodedToken = decodedToken; // Store the decoded token for potential later use

        next(); // Proceed to the next middleware
    } catch (error) {
        Logger.error(`Authentication processing error`, error, {
            path: req.originalUrl,
            method: req.method,
            errorName: error.name,
        });
        sendError(
            res,
            "Failed to process authentication token",
            500,
            { message: error.message },
            "AUTH_PROCESSING_ERROR"
        );
    }
};

/**
 * Middleware to find user in database based on Firebase UID.
 * Attaches `req.userId = user._id` for use in other operations.
 */
const checkUserId = async (req, res, next) => {
    try {
        const requestId = req.id || Math.random().toString(36).substring(2, 10);
        const uid = req.firebaseUid;

        if (!uid) {
            Logger.info(`Processing guest request`, {
                requestId,
                path: req.originalUrl,
                method: req.method,
            });
            req.userId = null;
            req.userRole = "guest";
            next();
            return;
        }

        // Log the database lookup attempt
        Logger.debug(`Looking up user in database`, {
            requestId,
            firebaseUid: uid,
        });

        const user = await User.findOne({ uid });

        if (user) {
            Logger.info(`User identified in database`, {
                requestId,
                userId: user._id.toString(),
                firebaseUid: uid,
                role: user.role || "user",
            });

            req.userId = user._id;
            req.userRole = user.role || "user";
            req.user = user; // Attach complete user object for convenience
        } else {
            Logger.warn(`Firebase authenticated user not found in database`, {
                requestId,
                firebaseUid: uid,
                path: req.originalUrl,
                action: "proceeding as guest",
            });

            req.userId = null;
            req.userRole = "guest";
            req.authStatus = "unregistered"; // Authenticated but not in our database
        }

        next();
    } catch (error) {
        Logger.error(`Database error during user lookup`, error, {
            path: req.originalUrl,
            method: req.method,
            firebaseUid: req.firebaseUid || "not available",
        });

        sendError(
            res,
            "Failed to verify user account",
            500,
            { message: error.message },
            "USER_VERIFICATION_ERROR"
        );
    }
};

module.exports = { checkUserId, checkUserFirebaseUid };
