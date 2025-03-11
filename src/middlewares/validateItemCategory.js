const { Category } = require("../models/CategoryModel");
const mongoose = require("mongoose"); // Add mongoose import to use ObjectId

const validateCategory = async (req, res, next) => {
    try {
        const { category } = req.body; // Extract category from request body

        if (!category) {
            return res.status(400).json({
                error: "Category is required",
            });
        }

        let resultCategory = null;

        // Check if the provided category is a valid MongoDB ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(category);

        if (isValidObjectId) {
            // First try to find by ID
            resultCategory = await Category.findById(category);
            console.log("CATEGORY:", resultCategory)
        }

        // If not found by ID or not a valid ObjectId, try to find by name
        if (!resultCategory) {
            resultCategory = await Category.findOne({ name: category });
        }

        if (!resultCategory) {
            console.error(`Category '${category}' not found`);

            // Retrieve all available categories
            const availableCategories = await Category.find({}, "name").lean();
            const categoryList = availableCategories
                .map((cat) => cat.name)
                .join(", ");

            return res.status(404).json({
                error: `Category '${category}' not found.`,
                availableCategories: categoryList || "No categories available",
                message: "Please provide a valid category name or ID",
            });
        }

        // Attach the category ID to the request object
        req.categoryId = resultCategory._id;
        next();
    } catch (error) {
        console.error("Error in validateCategory:", error.message);
        return res.status(500).json({
            error: "Internal server error while validating category",
            details: error.message,
        });
    }
};

module.exports = { validateCategory };
