const { Item } = require("../models/MenuItemModel");
const { Category } = require("../models/CategoryModel");
const { Topping } = require("../models/ToppingModel");

async function createMenuItem(
    name,
    description,
    basePrice,
    category,
    toppings = [],
    imageUrl
) {
    try {


        const newMenuItem = new Item({
            name,
            description,
            basePrice,
            category: category,
            toppings: toppings,
            imageUrl,
        });

        await newMenuItem.save();
        return newMenuItem;
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === "ValidationError") {
            const validationError = new Error(
                `Validation error: ${Object.values(error.errors)
                    .map((err) => err.message)
                    .join(", ")}`
            );
            validationError.statusCode = 400;
            throw validationError;
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            const duplicateError = new Error(
                `Menu item with this ${Object.keys(error.keyValue)[0]} already exists`
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        console.error("Error creating menu item:", error);

        // Preserve existing status code if available
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message =
                error.message || "Internal server error while creating menu item";
        }

        throw error;
    }
}

async function getMenuItemById(menuItemId) {
    try {
        if (!menuItemId) {
            const error = new Error("Menu item ID is required");
            error.statusCode = 400;
            throw error;
        }

        const menuItem = await Item.findById(menuItemId);

        if (!menuItem) {
            const error = new Error(`Menu item with ID ${menuItemId} not found`);
            error.statusCode = 404;
            throw error;
        }

        return menuItem;
    } catch (error) {
        console.error("Error fetching menu item:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError") {
            const castError = new Error(`Invalid menu item ID format: ${menuItemId}`);
            castError.statusCode = 400;
            throw castError;
        }

        // Preserve existing status code if available
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message =
                error.message || "Internal server error while fetching menu item";
        }

        throw error;
    }
}

async function getAllMenuItems(limit = null) {
    try {
        let query = Item.find();

        if (limit) {
            // Validate limit is a positive number
            if (isNaN(limit) || limit <= 0) {
                const error = new Error("Limit must be a positive number");
                error.statusCode = 400;
                throw error;
            }

            query = query.limit(limit);
        }

        const items = await query;

        return items;
    } catch (error) {
        console.error("Error fetching menu items:", error);

        // Preserve existing status code if available
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message =
                error.message || "Internal server error while fetching menu items";
        }

        throw error;
    }
}

async function updateMenuItem(menuItemId, updateData) {
    try {
        if (!menuItemId) {
            const error = new Error("Menu item ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            const error = new Error("No update data provided");
            error.statusCode = 400;
            throw error;
        }

        const updatedMenuItem = await Item.findByIdAndUpdate(
            menuItemId,
            updateData,
            {
                new: true,
                runValidators: true, // Ensure validation runs on update
            }
        );

        if (!updatedMenuItem) {
            const error = new Error(`Menu item with ID ${menuItemId} not found`);
            error.statusCode = 404;
            throw error;
        }

        return updatedMenuItem;
    } catch (error) {
        console.error("Error updating menu item:", error);

        // Handle mongoose validation errors
        if (error.name === "ValidationError") {
            const validationError = new Error(
                `Validation error: ${Object.values(error.errors)
                    .map((err) => err.message)
                    .join(", ")}`
            );
            validationError.statusCode = 400;
            throw validationError;
        }

        // Handle invalid ObjectId format
        if (error.name === "CastError") {
            const castError = new Error(`Invalid menu item ID format: ${menuItemId}`);
            castError.statusCode = 400;
            throw castError;
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            const duplicateError = new Error(
                `Update would create a duplicate ${Object.keys(error.keyValue)[0]}`
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        // Preserve existing status code if available
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message =
                error.message || "Internal server error while updating menu item";
        }

        throw error;
    }
}

async function deleteMenuItem(menuItemId) {
    try {
        if (!menuItemId) {
            const error = new Error("Menu item ID is required");
            error.statusCode = 400;
            throw error;
        }

        const deletedMenuItem = await Item.findByIdAndDelete(menuItemId);

        if (!deletedMenuItem) {
            const error = new Error(
                `Menu item with ID ${menuItemId} not found or already deleted`
            );
            error.statusCode = 404;
            throw error;
        }

        return deletedMenuItem;
    } catch (error) {
        console.error("Error deleting menu item:", error);

        // Handle invalid ObjectId format
        if (error.name === "CastError") {
            const castError = new Error(`Invalid menu item ID format: ${menuItemId}`);
            castError.statusCode = 400;
            throw castError;
        }

        // Preserve existing status code if available
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message =
                error.message || "Internal server error while deleting menu item";
        }

        throw error;
    }
}

module.exports = {
    createMenuItem,
    getMenuItemById,
    getAllMenuItems,
    updateMenuItem,
    deleteMenuItem,
};
