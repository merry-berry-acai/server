const { User } = require("../models/UserModel");

const checkAdminRole = async (req, res, next) => {
    try {
        // Ensure the user is authenticated and has a UID
        if (!req.firebaseUid) {
            return res.status(401).json({ error: "Unauthorized: No Firebase UID provided" });
        }

        // Fetch user from the database
        const user = await User.findOne({ uid: req.firebaseUid });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user role is "admin"
        if (user.role !== "admin") {
            console.log("Forbidden: Admin access required");
            return res.status(403).json({ error: "Forbidden: Admin access required" });
        }
        
        // User is an admin, continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in checkAdminRole middleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { checkAdminRole };