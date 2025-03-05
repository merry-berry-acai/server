const { Topping } = require("../models/ToppingModel"); // Ensure correct import

const validateToppings = async (req, res, next) => {
    try {
        const { toppings } = req.body; // Extract toppings from request body

        // If toppings are not provided, skip validation and continue
        if (!toppings) {
            return next();
        }

        // Ensure toppings is an array
        if (!Array.isArray(toppings)) {
            return res.status(400).json({ error: "Toppings must be an array of names." });
        }

        // Find toppings by their names
        const foundToppings = await Topping.find({ name: { $in: toppings } }, "_id name").lean();

        // Extract valid topping IDs
        req.toppingIds = foundToppings.map(topping => topping._id);

        // Check for missing toppings
        const foundToppingNames = foundToppings.map(t => t.name);
        const missingToppings = toppings.filter(name => !foundToppingNames.includes(name));

        if (missingToppings.length > 0) {
            console.error(`Toppings not found: ${missingToppings.join(", ")}`);

            // Retrieve all available toppings
            const availableToppings = await Topping.find({}, "name").lean();
            const availableToppingNames = availableToppings.map(t => t.name);

            return res.status(404).json({
                error: `Some toppings were not found: ${missingToppings.join(", ")}`,
                availableToppings: availableToppingNames || "No toppings available"
            });
        }

        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error("Error in validateToppings:", error.message);
        return res.status(500).json({ error: "Internal server error: " + error.message });
    }
};

module.exports = { validateToppings };