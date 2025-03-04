const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");

/**
 * Middleware to extract Firebase UID without verification.
 * Attaches `req.userId = user._id` for order creation.
 */
const checkUser = async (req, res, next) => {
    try {
        // Get Authorization header - if no authentication, continue as guest
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("Proceeding as guest (no Authorization header)");
            req.firebaseUid = null;
            req.userId = null;
            next();
            return;
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
            req.userId = null;
            console.log("NEW USER REGISTRATION");
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
