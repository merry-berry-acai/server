const { User } = require("../models/UserModel");

/**
 * Middleware to check if a user already exists before creating or updating
 * For POST requests: Checks if email already exists
 * For PUT/PATCH requests: Allows users to update their own record while preventing email conflicts
 */
const checkDuplicateUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        // If no email in the request body, no need to check for duplicates
        if (!email) {
            return next();
        }

        // Check if this is an update (PUT/PATCH) or create (POST) request
        const isUpdate = ["PUT", "PATCH"].includes(req.method);

        if (isUpdate) {
            // Get the current user's ID based on the request
            let currentUserId;

            // For routes like /:id or /me/update
            if (req.params.id) {
                currentUserId = req.params.id;
            } else if (req.firebaseUid) {
                // If we have Firebase UID from authentication middleware
                const currentUser = await User.findOne({ uid: req.firebaseUid });
                if (currentUser) {
                    currentUserId = currentUser._id;
                }
            }

            if (!currentUserId) {
                return res.status(400).json({
                    error: "User identification required for update",
                });
            }

            // Find the user with the provided email
            const existingUserWithEmail = await User.findOne({ email });

            // If no user has this email or the user with this email is the same as the current user, allow the update
            if (
                !existingUserWithEmail ||
                existingUserWithEmail._id.toString() === currentUserId.toString()
            ) {
                return next();
            }

            // If another user already has this email
            return res.status(409).json({
                error: "Email already in use by another user",
                message: "Please choose a different email address",
            });
        } else {
            // For new user creation (POST), simply check if the email already exists
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(409).json({
                    error: "User with this email already exists",
                    message: "Please use a different email address or try to log in",
                });
            }

            next();
        }
    } catch (error) {
        console.error("Error checking duplicate user:", error);
        res.status(500).json({
            error: "Internal server error while checking user data",
            details: error.message || "Unknown error occurred",
        });
    }
};

module.exports = { checkDuplicateUser };
