const { User } = require("../models/UserModel");

/**
 * Middleware to check if a user exists based on Firebase UID.
 * Attaches `req.userId = user._id` to be used in order creation.
 */
const checkUser = async (req, res, next) => {
    try {
        // Extract `uid` from request body
        const { uid } = req.body; 

        // Ensure `uid` is provided
        if (!uid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        // Find the user by Firebase UID
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ error: "User not found. Please register before ordering." });
        }

        // Attach user _id for order creation
        req.userId = user._id;
        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { checkUser }; // Destructured export
