const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");

/**
 * Middleware to extract Firebase UID without verification.
 * Attaches `req.userId = user._id` for order creation.
 */
const checkUserFirebaseUid = async (req, res, next) => {
    try {
        // Get Authorization header - if no authentication, continue as guest
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("Proceeding as guest (no Authorization header)");
            req.firebaseUid = null;
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


        // Attach the Firebase UID to the request
        req.firebaseUid = uid;

        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const checkUserId = async (req, res, next) => {
    try {
        // Find the user in the database by Firebase uid
        uid = req.firebaseUid;
        const user = await User.findOne({ uid });

        if (user) {
            req.userId = user._id;
        }
        else {
            req.userId = null;
            console.log("User not registered. Continue as guest");
        }

        next();

    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = { checkUserId, checkUserFirebaseUid };
