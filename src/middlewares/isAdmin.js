const { User } = require('../models/UserModel');

const isAdmin = async (req, res, next) => {
    try {

        // Fetch user from database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is an admin
        if (!user.admin) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        next(); // User is an admin, proceed to the route handler
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = isAdmin;
