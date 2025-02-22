const ITEM_CATEGORIES = ["smoothie", "akai", "juice"];

const validateCategory = (req, res, next) => {
    const { category } = req.body;

    // If `category` is not supplied, skip validation and proceed
    if (!category) {
        return next();
    }

    // If `category` is invalid, return an error
    if (!ITEM_CATEGORIES.includes(category)) {
        console.error(`Invalid category: "${category}". Allowed: ${ITEM_CATEGORIES.join(", ")}`);
        return res.status(400).json({ error: `Invalid category: "${category}". Must be one of ${ITEM_CATEGORIES.join(", ")}` });
    }

    next();
};

module.exports = { validateCategory };