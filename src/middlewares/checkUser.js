const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");

/**
 * Middleware to extract Firebase UID without verification.
 * Attaches `req.userId = user._id` for order creation.
 */
const checkUser = async (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        }

        // Extract token from "Bearer <token>"
        const idToken = authHeader.split(" ")[1];

        // Decode the token without verifying
        const decodedToken = jwt.decode(idToken);

        // Ensure the token contains a UID
        if (!decodedToken || !decodedToken.user_id) {
            return res.status(401).json({ error: "Invalid Firebase token" });
        }

        // Extract UID from the decoded token
        const uid = decodedToken.user_id;

        console.log("Extracted Firebase UID: ", uid);

        // Find the user in the database
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ error: "User not found. Please register before ordering." });
        }

        // Attach the Firebase UID to the request
        req.firebaseUid = uid;

        // Attach user _id to the request
        req.userId = user._id;
        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { checkUser };
