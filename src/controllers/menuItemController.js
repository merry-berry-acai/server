const { Category } = require("../models/CategoryModel");
const { Item } = require("../models/MenuItemModel");

// Category validation
async function validateCategoryAndGetId(categoryName) {
    if (!categoryName) return null; // Skip validation if category is not provided

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
        console.error(`Category '${categoryName}' not found`);
        const availableCategories = await Category.find({}, "name").lean();
        throw new Error(`Category '${categoryName}' not found. Available categories: ${availableCategories.map(cat => cat.name).join(", ")}`);
    }

    return category._id;
}

async function createMenuItem(name, description, basePrice, category, imageUrl = "", toppings = []) {

    try {

        // Validate and return category ID
        const categoryId = await validateCategoryAndGetId(category);

        // Validate toppings (convert to ObjectIds)
        const toppingIds = toppings.map(toppingId => String(toppingId));

        const newMenuItem = new Item({
            name,
            description,
            basePrice,
            category: categoryId,
            imageUrl,
            toppings: toppingIds
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
        // Validate and replace category name with ObjectId if necessary
        if (updateData.category) {
            updateData.category = await validateCategoryAndGetId(updateData.category);
        }

        const updatedMenuItem = await Item.findByIdAndUpdate(menuItemId, updateData, { new: true });

        if (!updatedMenuItem) {
            return { error: "Menu item not found or update failed" };
        }

        return updatedMenuItem;
    } catch (error) {
        console.error("❌ Error updating menu item:", error.message);
        return { error: error.message };
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
