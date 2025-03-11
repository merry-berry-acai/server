const { User } = require("../models/UserModel");

/**
 * Helper function to check if the requested ID matches user's ID or UID
 */
const isSelfAccess = (requestedId, user) => {
    if (!requestedId || !user) return false;

    // Check MongoDB _id match (convert to string for comparison)
    if (user._id && requestedId === user._id.toString()) {
        return true;
    }

    // Check Firebase UID match
    if (user.uid && requestedId === user.uid) {
        return true;
    }

    return false;
};

const checkAdminRole = async (req, res, next) => {
    try {
        // First check if user data was already attached by previous middleware
        if (req.userRole) {
            // Check if user is admin
            if (req.userRole === "admin") {
                console.log(
                    `Admin access granted for user: ${req.user?.email || req.firebaseUid}`
                );
                return next();
            }

            // If not admin, check if user is accessing their own data
            const requestedUserId = req.params.id;

            // Use helper function to check for self-access
            if (isSelfAccess(requestedUserId, req.user)) {
                console.log(
                    `Self-access granted for user: ${req.user?.email || req.firebaseUid}`
                );
                return next();
            }

            // User is neither admin nor accessing their own data
            console.log(
                `Access denied: User ${req.user?.email || req.firebaseUid} (${req.userRole
                }) attempted to access resource for ID: ${requestedUserId}`
            );
            return res.status(403).json({
                error: "Forbidden: Insufficient permissions",
                message:
                    "You do not have permission to access this resource. You can only access your own data or need admin privileges.",
                code: "INSUFFICIENT_PERMISSIONS",
            });
        }

        // If we don't have user role yet, check if we at least have firebaseUid
        if (!req.firebaseUid) {
            return res.status(401).json({
                error: "Unauthorized: Authentication required",
                message:
                    "You must be logged in to access this resource. Please authenticate and try again.",
                code: "AUTHENTICATION_REQUIRED",
            });
        }

        // Need to fetch user from the database since it wasn't provided by previous middleware
        const user = await User.findOne({ uid: req.firebaseUid });

        if (!user) {
            console.log(`User not found for Firebase UID: ${req.firebaseUid}`);
            return res.status(404).json({
                error: "User not found",
                message:
                    "Your account could not be located in our system. Please contact support if this problem persists.",
                code: "USER_NOT_FOUND",
            });
        }

        // Attach user data for convenience in route handlers
        req.user = user;
        req.userRole = user.role;
        req.userId = user._id;

        // Check if user is admin
        if (user.role === "admin") {
            console.log(`Admin access granted for user: ${user.email || user.uid}`);
            return next();
        }

        // If not admin, check if user is accessing their own data
        const requestedUserId = req.params.id;

        // Use helper function to check for self-access
        if (isSelfAccess(requestedUserId, user)) {
            console.log(`Self-access granted for user: ${user.email || user.uid}`);
            return next();
        }

        // User is neither admin nor accessing their own data
        console.log(
            `Access denied: User ${user.email || user.uid} (${user.role
            }) attempted to access resource for ID: ${requestedUserId}`
        );
        return res.status(403).json({
            error: "Forbidden: Insufficient permissions",
            message:
                "You do not have permission to access this resource. You can only access your own data or need admin privileges.",
            code: "INSUFFICIENT_PERMISSIONS",
        });
    } catch (error) {
        console.error(
            "Error in checkAdminRole middleware:",
            error.message,
            error.stack
        );
        res.status(500).json({
            error: "Internal server error",
            message:
                "An unexpected error occurred while verifying your permissions. Please try again later.",
            code: "SERVER_ERROR",
        });
    }
};

module.exports = { checkAdminRole };
