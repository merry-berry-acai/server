const { User } = require("../models/UserModel");

async function createUser(userData) {
    try {
        const { uid, displayName, email, photoURL = "", favorites = [], role = 'user' } = userData;
        
        // Set admin flag based on role for backward compatibility
        const admin = role === 'admin';
        
        const newUser = new User({
            uid,
            displayName,
            email,
            photoURL,
            favorites,
            role
        });

        await newUser.save();
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
    }
}

async function getUserById(userId) {
    try {

        const user = await User.findById(userId)
            .populate({
                path: "orderHistory",
                select: "_id items totalPrice", // Select order fields
                populate: [
                    {
                        path: "items.product", // Populate product details
                        select: "name basePrice category"
                    },
                    {
                        path: "items.toppings", //Populate topping details
                        select: "name price"
                    }
                ]
            });

        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
    }
}

async function getAllUsers() {
    try {
        return await User.find().populate("orderHistory");
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

async function updateUser(userId, updateData) {
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        }).populate("orderHistory");

        if (!updatedUser) throw new Error("User not found or update failed");
        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
}

async function deleteUser(userId) {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) throw new Error("User not found or already deleted");
        return deletedUser;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
}

async function getUserRoleByUid(uid) {
    try {
        const user = await User.findOne({ uid });
        if (!user) throw new Error("User not found");
        return { role: user.role };
    } catch (error) {
        console.error("Error fetching user role:", error);
        throw new Error("Failed to fetch user role");
    }
}

// New function to get user by Firebase UID
async function getUserByUid(uid) {
    try {
        const user = await User.findOne({ uid })
            .populate({
                path: "orderHistory",
                select: "_id items totalPrice", // Select order fields
                populate: [
                    {
                        path: "items.product", // Populate product details
                        select: "name basePrice category"
                    },
                    {
                        path: "items.toppings", //Populate topping details
                        select: "name price"
                    }
                ]
            });

        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        console.error("Error fetching user by UID:", error);
        throw new Error("Failed to fetch user");
    }
}

// New function to update user by Firebase UID
async function updateUserByUid(uid, updateData) {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { uid },
            updateData,
            { new: true }
        ).populate("orderHistory");

        if (!updatedUser) throw new Error("User not found or update failed");
        return updatedUser;
    } catch (error) {
        console.error("Error updating user by UID:", error);
        throw new Error("Failed to update user");
    }
}

// New function to delete user by Firebase UID
async function deleteUserByUid(uid) {
    try {
        const deletedUser = await User.findOneAndDelete({ uid });
        if (!deletedUser) throw new Error("User not found or already deleted");
        return deletedUser;
    } catch (error) {
        console.error("Error deleting user by UID:", error);
        throw new Error("Failed to delete user");
    }
}

module.exports = {
    createUser,
    getUserById, // Keep for backward compatibility
    getAllUsers,
    updateUser, // Keep for backward compatibility
    deleteUser, // Keep for backward compatibility
    getUserRoleByUid,
    getUserByUid,
    updateUserByUid,
    deleteUserByUid
};
