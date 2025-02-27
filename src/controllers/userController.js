const { User } = require("../models/UserModel");

async function createUser(displayName, email, admin) {
    try {

        const newUser = new User({
            displayName,
            email,
            admin
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


module.exports = {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
};
