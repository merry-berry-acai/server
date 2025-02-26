const { Category } = require("../models/CategoryModel");
const { Item } = require("../models/MenuItemModel");

// Category validation
async function validateCategoryAndGetId(categoryName) {
    try {
        if (!categoryName) {
            return { error: "Category name is required." };
        }

        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            console.error(`Category '${categoryName}' not found`);

            // Retrieve all available categories
            const availableCategories = await Category.find({}, "name").lean();
            const categoryList = availableCategories.map(cat => cat.name).join(", ");

            return {
                error: `Category '${categoryName}' not found.`,
                availableCategories: categoryList || "No categories available"
            };
        }

        return category._id;
    } catch (error) {
        console.error("Error in validateCategoryAndGetId:", error.message);
        return { error: "Internal server error: " + error.message };
    }
}



async function createMenuItem(name, description, basePrice, category, imageUrl = "", toppings = []) {

    try {

        // Validate category
        const categoryResult = await validateCategoryAndGetId(category);

        // Check if category is not found
        if (categoryResult.error) {
            console.error("Error in createMenuItem:", categoryResult.error);
            return {
                error: categoryResult.error,
                availableCategories: categoryResult.availableCategories // Return available categories
            };
        }

        // Validate toppings (convert to ObjectIds)
        const toppingIds = toppings.map(toppingId => String(toppingId));

        const newMenuItem = new Item({
            name,
            description,
            basePrice,
            category: categoryResult,
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
        console.error("Error updating menu item:", error.message);
        return { error: error.message };
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
