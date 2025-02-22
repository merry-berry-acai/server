const { Item } = require("../models/MenuItemModel");


async function createMenuItem(name, description, basePrice, category, imageUrl = "") {
    const ITEM_CATEGORIES = ["smoothie", "akai", "juice"];

    try {

        if (!ITEM_CATEGORIES.includes(category)) {
            console.error(`Invalid category: "${category}". Allowed: ${ITEM_CATEGORIES.join(", ")}`);
            return { error: `Invalid category: "${category}". Must be one of ${ITEM_CATEGORIES.join(", ")}` };
        }

        const newMenuItem = new Item({
            name,
            description,
            basePrice,
            category,
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

async function getAllMenuItems() {
    try {
        return await Item.find();
    } catch (error) {
        console.error("Error fetching menu items:", error);
        throw new Error("Failed to fetch menu items");
    }
}

async function updateMenuItem(menuItemId, updateData) {
    try {
        const updatedMenuItem = await Item.findByIdAndUpdate(menuItemId, updateData, { new: true });
        if (!updatedMenuItem) throw new Error("Menu item not found or update failed");
        return updatedMenuItem;
    } catch (error) {
        console.error("Error updating menu item:", error);
        throw new Error("Failed to update menu item");
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
};
