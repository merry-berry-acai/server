const { Category } = require("../models/CategoryModel");
const { Topping } = require("../models/ToppingModel");

/**
 * Retrieves and validates a category by name.
 */
async function validateCategory(categoryName) {
    if (!categoryName || typeof categoryName !== "string") {
        throw new Error("Category must be a valid string.");
    }

    const category = await Category.findOne({ name: categoryName.trim() });

    if (!category) {
        throw new Error(`Category '${categoryName}' not found.`);
    }

    return category._id; // Return ObjectId of the category
}

/**
 * Retrieves and validates topping IDs by their names.
 * @param {string[]} toppingNames - An array of topping names.
 * @returns {Promise<ObjectId[]>} An array of ObjectIds corresponding to the provided topping names.
 * @throws {Error} If any topping is not found.
 */
async function validateToppings(toppingNames) {
    if (!Array.isArray(toppingNames)) {
        throw new Error("Toppings must be an array of strings.");
    }

    if (toppingNames.length === 0) {
        return []; // Return an empty array if no toppings are provided
    }

    const toppings = await Topping.find({ name: { $in: toppingNames } }, "_id name").lean();

    // Extract valid topping IDs
    const toppingIds = toppings.map(t => t._id);

    // Check for missing toppings
    const foundToppingNames = toppings.map(t => t.name);
    const missingToppings = toppingNames.filter(name => !foundToppingNames.includes(name));

    if (missingToppings.length > 0) {
        throw new Error(`Toppings not found: ${missingToppings.join(", ")}`);
    }

    return toppingIds;
}

module.exports = { validateCategory, validateToppings };
