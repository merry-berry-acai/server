const { User } = require("../models/UserModel");
const { ApiError } = require("../utils/errorHandler");

async function createUser(userData) {
    try {
        const {
            uid,
            displayName,
            email,
            photoURL = "",
            favorites = [],
            role = "user",
        } = userData;

        // Validate role is allowed
        if (role && !["user", "admin"].includes(role)) {
            throw new ApiError(400, "Role must be either 'user' or 'admin'");
        }

        const newUser = new User({
            uid,
            displayName,
            email,
            photoURL,
            favorites,
            role,
        });

        await newUser.save();
        return newUser;
    } catch (error) {
        // Re-throw ApiError instances
        if (error instanceof ApiError) throw error;

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            throw new ApiError(
                409,
                `Duplicate value detected: ${Object.keys(error.keyValue)[0]
                } already exists`
            );
        }

        console.error("Error creating user:", error);
        throw new ApiError(500, "Failed to create user");
    }
}

/**
 * Get a user by ID - supports both MongoDB ObjectId and Firebase UID
 */
const getUserById = async (id) => {
    try {
        // First, check if the ID is a valid MongoDB ObjectId
        const isValidObjectId = id.match(/^[0-9a-fA-F]{24}$/);

        let user;

        if (isValidObjectId) {
            // If it looks like an ObjectId, try to find by _id
            user = await User.findById(id);
        }

        if (!user) {
            // If not found by ObjectId or if it's not a valid ObjectId,
            // try to find by Firebase UID
            user = await User.findOne({ uid: id });
        }

        if (!user) {
            throw new Error(`User with ID/UID '${id}' not found`);
        }

        return user;
    } catch (error) {
        console.error(`Error fetching user: ${error}`);
        throw error;
    }
};

async function getAllUsers() {
    try {
        return await User.find().populate("orderHistory");
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new ApiError(500, "Failed to fetch users");
    }
}

async function updateUser(userId, updateData) {
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        }).populate("orderHistory");

        if (!updatedUser)
            throw new ApiError(404, "User not found or update failed");
        return updatedUser;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error updating user:", error);
        throw new ApiError(500, "Failed to update user");
    }
}

async function deleteUser(userId) {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser)
            throw new ApiError(404, "User not found or already deleted");
        return deletedUser;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error deleting user:", error);
        throw new ApiError(500, "Failed to delete user");
    }
}

// New function to get user by Firebase UID
async function getUserByUid(uid) {
    try {
        const user = await User.findOne({ uid }).populate({
            path: "orderHistory",
            select: "_id items totalPrice", // Select order fields
            populate: [
                {
                    path: "items.product", // Populate product details
                    select: "name basePrice category",
                },
                {
                    path: "items.toppings", //Populate topping details
                    select: "name price",
                },
            ],
        });

        if (!user) {
            throw new ApiError(404, `User with uid ${uid} not found`);
        }

        return user;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error fetching user by UID:", error);
        throw new ApiError(500, "Failed to fetch user");
    }
}

// New function to update user by Firebase UID
async function updateUserByUid(uid, updateData) {
    try {
        const updatedUser = await User.findOneAndUpdate({ uid }, updateData, {
            new: true,
        }).populate("orderHistory");

        if (!updatedUser)
            throw new ApiError(404, "User not found or update failed");
        return updatedUser;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error updating user by UID:", error);
        throw new ApiError(500, "Failed to update user");
    }
}

// New function to delete user by Firebase UID
async function deleteUserByUid(uid) {
    try {
        const deletedUser = await User.findOneAndDelete({ uid });
        if (!deletedUser)
            throw new ApiError(404, "User not found or already deleted");
        return deletedUser;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error deleting user by UID:", error);
        throw new ApiError(500, "Failed to delete user");
    }
}

/**
 * Get orders for a specific user by ID or UID
 * Supports both MongoDB ObjectId and Firebase UID
 */
async function getUserOrders(id) {
    try {
        // First determine if we're looking up by MongoDB ObjectId or Firebase UID
        const isValidObjectId = id.match(/^[0-9a-fA-F]{24}$/);

        let user;

        if (isValidObjectId) {
            // If it looks like an ObjectId, try to find by _id
            user = await User.findById(id).populate({
                path: "orderHistory",
                options: { sort: { createdAt: -1 } }, // Sort by newest orders first
                populate: [
                    {
                        path: "items.product",
                        select: "name basePrice category imageUrl",
                    },
                    {
                        path: "items.toppings",
                        select: "name price",
                    },
                ],
            });
        }

        if (!user) {
            // If not found by ObjectId or if it's not a valid ObjectId,
            // try to find by Firebase UID
            user = await User.findOne({ uid: id }).populate({
                path: "orderHistory",
                options: { sort: { createdAt: -1 } }, // Sort by newest orders first
                populate: [
                    {
                        path: "items.product",
                        select: "name basePrice category imageUrl",
                    },
                    {
                        path: "items.toppings",
                        select: "name price",
                    },
                ],
            });
        }

        if (!user) {
            throw new ApiError(404, `User with ID/UID '${id}' not found`);
        }

        // Check if user has any order history
        if (!user.orderHistory || user.orderHistory.length === 0) {
            return []; // Return empty array if no orders
        }

        // Add order status and formatted date for the frontend
        const ordersWithDetails = user.orderHistory.map((order) => {
            const orderObject = order.toObject();

            // Add formatted date
            orderObject.formattedDate = new Date(order.createdAt).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

            // Calculate order totals for each item with proper null checks
            orderObject.items = orderObject.items.map((item) => {
                // Handle case where product might be null (deleted product)
                if (!item.product) {
                    item.product = {
                        name: "Product no longer available",
                        basePrice: 0,
                        category: "Unknown",
                        imageUrl: null,
                    };
                    item.itemTotal = 0;
                    return item;
                }

                // Calculate toppings total with null check
                const toppingsTotal = item.toppings
                    ? item.toppings.reduce(
                        (sum, topping) => sum + (topping ? topping.price || 0 : 0),
                        0
                    )
                    : 0;

                // Calculate item total
                const basePrice = item.product.basePrice || 0;
                item.itemTotal = (basePrice + toppingsTotal) * (item.quantity || 1);

                return item;
            });

            return orderObject;
        });

        return ordersWithDetails;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error fetching user orders:", error);
        throw new ApiError(500, "Failed to fetch user orders");
    }
}

module.exports = {
    createUser,
    getUserById, // Keep for backward compatibility
    getAllUsers,
    updateUser, // Keep for backward compatibility
    deleteUser, // Keep for backward compatibility
    getUserByUid,
    updateUserByUid,
    deleteUserByUid,
    getUserOrders, // Add the new function to exports
};
