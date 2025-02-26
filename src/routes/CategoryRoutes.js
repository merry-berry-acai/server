const express = require("express");
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");


const router = express.Router();

// Create a category
router.post("/new", async (req, res) => {
    try {
        const { name } = req.body;
        const category = await createCategory(name);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get category by ID
router.get("/:id", async (req, res) => {
    try {
        const category = await getCategoryById(req.params.id);
        res.status(200).json(category);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Update category
router.put("/:id", async (req, res) => {
    try {
        const { name } = req.body;
        const updatedCategory = await updateCategory(req.params.id, name);
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete category
router.delete("/:id", async (req, res) => {
    try {
        deletedCategory = await getCategoryById(req.params.id);
        await deleteCategory(req.params.id);
        res.status(200).json({ message: `Category '${deletedCategory._id}' successfully deleted.` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
