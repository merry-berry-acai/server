const { Item } = require("../models/MenuItemModel");

async function createMenuItem(name, description, basePrice, category,  toppings=[], imageUrl) {

    try {

        const newMenuItem = new Item({
            name,
            description,
            basePrice,
            category,
            toppings,
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
    deleteMenuItem
};
