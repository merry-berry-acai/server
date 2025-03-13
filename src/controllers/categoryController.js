const { Category } = require("../models/CategoryModel");

async function createCategory(name) {
    try {
        // Convert name to lowercase for consistency
        name = name.toLowerCase();

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return {
                status: 400,
                error: `Category '${name}' already exists`
            };
        }

        const newCategory = new Category({ name });
        await newCategory.save();
        return newCategory;
    } catch (error) {
        console.error("Error creating category:", error);
        throw new Error("Failed to create category");
    }
}

async function getAllCategories() {
    try {
        return await Category.find();
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Failed to fetch categories");
    }
}

async function getCategoryById(categoryId) {
    try {
        const category = await Category.findById(categoryId);
        if (!category) throw new Error("Category not found");
        return category;
    } catch (error) {
        console.error("Error fetching category:", error);
        throw new Error("Failed to fetch category");
    }
}

async function updateCategory(categoryId, name) {
    try {
        name = name.toLowerCase();
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true, runValidators: true }
        );
        if (!updatedCategory) throw new Error("Category not found or update failed");
        return updatedCategory;
    } catch (error) {
        console.error("Error updating category:", error);
        throw new Error("Failed to update category");
    }
}

async function deleteCategory(categoryId) {
    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) throw new Error("Category not found or already deleted");
        return deletedCategory;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Failed to delete category");
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};