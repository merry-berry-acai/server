const { Topping } = require("../models/ToppingModel");
const mongoose = require("mongoose");

/**
 * Middleware to validate and retrieve topping IDs based on provided topping names or ObjectIds.
 * Attaches the topping IDs to `req.toppingIds` if valid.
 */
const validateToppings = async (req, res, next) => {
    try {
        const { toppings } = req.body; // Extract toppings from request body

        // If no toppings are provided, continue without validation
        if (!toppings) {
            req.toppingIds = []; // Ensure req.toppingIds is always defined
            return next();
        }

        // Ensure toppings is an array
        if (!Array.isArray(toppings)) {
            return res.status(400).json({ error: "Toppings must be an array of names or ObjectIds." });
        }

        let foundToppings = [];
        let missingToppings = [];

        for (const topping of toppings) {
            let resultTopping = null;
            const isValidObjectId = mongoose.Types.ObjectId.isValid(topping);

            if (isValidObjectId) {
                // First, try finding by ObjectId
                resultTopping = await Topping.findById(topping);
            }

            // If not found by ID or not a valid ObjectId, try to find by name
            if (!resultTopping) {
                resultTopping = await Topping.findOne({ name: topping });
            }

            if (resultTopping) {
                foundToppings.push(resultTopping._id);
            } else {
                missingToppings.push(topping);
            }
        }

        if (missingToppings.length > 0) {
            console.error(`Toppings not found: ${missingToppings.join(", ")}`);

            // Retrieve all available toppings
            const availableToppings = await Topping.find({}, "name").lean();
            const availableToppingNames = availableToppings.map(t => t.name);

            return res.status(404).json({
                error: `Some toppings were not found: ${missingToppings.join(", ")}`,
                availableToppings: availableToppingNames || "No toppings available",
                message: "Please provide valid topping names or IDs."
            });
        }

        // Attach valid topping IDs to request
        req.toppingIds = foundToppings;
        next(); // Proceed to next middleware
    } catch (error) {
        console.error("Error in validateToppings:", error.message);
        return res.status(500).json({
            error: "Internal server error while validating toppings",
            details: error.message,
        });
    }
};

module.exports = { validateToppings };
