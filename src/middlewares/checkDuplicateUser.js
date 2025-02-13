const { User } = require("../models/UserModel");

/**
 * Middleware to check if a user already exists before creating a new one
 */
const checkDuplicateUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Ensure email is provided
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists." }); // 409 Conflict
        }

        next(); // Move to the next middleware or controller function
    } catch (error) {
        console.error("Error checking duplicate user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { checkDuplicateUser };
