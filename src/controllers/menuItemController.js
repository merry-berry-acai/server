const { Category } = require("../models/CategoryModel");
const { Item } = require("../models/MenuItemModel");
const { Topping } = require("../models/ToppingModel");


// Topping validation
async function validateToppingsAndGetIds(toppingNames) {
    try {
        if (!toppingNames || toppingNames.length === 0) {
            return []; // No toppings provided, return an empty array
        }

        // Find toppings by their names
        const toppings = await Topping.find({ name: { $in: toppingNames } }, "_id name").lean();

        // Extract valid topping IDs
        const validToppingIds = toppings.map(topping => topping._id);

        // Check if any toppings were not found
        const foundToppingNames = toppings.map(t => t.name);
        const missingToppings = toppingNames.filter(name => !foundToppingNames.includes(name));

        if (missingToppings.length > 0) {
            console.error(`Toppings not found: ${missingToppings.join(", ")}`);

            // Retrieve all available toppings
            const availableToppings = await Topping.find({}, "name").lean();
            const availableToppingNames = availableToppings.map(t => t.name).join(", ");

            return {
                error: `Toppings not found: ${missingToppings.join(", ")}`,
                availableToppings: availableToppingNames || "No toppings available"
            };
        }

        return validToppingIds; // Return valid topping IDs
    } catch (error) {
        console.error("Error in validateToppingsAndGetIds:", error.message);
        return { error: "Internal server error: " + error.message };
    }
}




async function createMenuItem(name, description, basePrice, category,  toppingNames = [], imageUrl) {

    try {
        // Validate toppings
        const toppingsResult = await validateToppingsAndGetIds(toppingNames);

        const newMenuItem = new Item({
            name,
            description,
            basePrice,
            category,
            toppings: toppingsResult,
            imageUrl,
        });

        await newMenuItem.save();
        return newMenuItem;
    } catch (error) {
        console.error("Error creating menu item:", error);
        throw new Error("Failed to create menu item");
    }
}

async function getMenuItemById(menuItemId) {
    try {
        const menuItem = await Item.findById(menuItemId);
        if (!menuItem) throw new Error("Menu item not found");
        return menuItem;
    } catch (error) {
        console.error("Error fetching menu item:", error);
        throw new Error("Failed to fetch menu item");
    }
}

async function getAllMenuItems(limit = null) {
    try {
        let query = Item.find();

        if (limit) {
            query = query.limit(limit);
        }

        return await query;
    } catch (error) {
        console.error("Error fetching menu items:", error);
        throw new Error("Failed to fetch menu items");
    }
}


async function updateMenuItem(menuItemId, updateData) {
    try {
        const updatedMenuItem = await Item.findByIdAndUpdate(menuItemId, updateData, { new: true });

        if (!updatedMenuItem) {
            const error = new Error("Menu item not found or update failed.");
            error.statusCode = 404; // 
            throw error;
        }

        return updatedMenuItem;
    } catch (error) {
        console.error("Error updating menu item:", error.message);

        error.statusCode = error.statusCode || 500;
        throw error;
    }
}

async function getItemsByCategory(categoryName) {
    try {
        // Validate category and get the category ID
        const categoryId = await validateCategoryAndGetId(categoryName);

        // If an error is returned from validation, return it directly
        if (categoryId.error) {
            return categoryId;
        }

        // Retrieve items that belong to the given category
        const items = await Item.find({ category: categoryId }).populate("toppings");

        return items.length > 0 ? items : { message: `No items found for category '${categoryName}'.` };

    } catch (error) {
        console.error("Error retrieving items by category:", error.message);
        return { error: "Internal server error: " + error.message };
    }
}



async function deleteMenuItem(menuItemId) {
    try {
        const deletedMenuItem = await Item.findByIdAndDelete(menuItemId);
        if (!deletedMenuItem) throw new Error("Menu item not found or already deleted");
        return deletedMenuItem;
    } catch (error) {
        console.error("Error deleting menu item:", error);
        throw new Error("Failed to delete menu item");
    }
}

module.exports = {
    createMenuItem,
    getMenuItemById,
    getAllMenuItems,
    updateMenuItem,
    deleteMenuItem,
    getItemsByCategory
};
