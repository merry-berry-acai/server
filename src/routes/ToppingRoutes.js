const express = require("express");
const router = express.Router();
const {
  createTopping,
  getToppingById,
  getAllToppings,
  updateTopping,
  deleteTopping,
} = require("../controllers/toppingController");

/**
 * Create a new topping
 */
router.post("/new", async (req, res) => {
  try {
    const { name, price, availability, category } = req.body;
    const newTopping = await createTopping(name, price, availability, category);
    res.status(201).json({ message: "Topping created successfully", data: newTopping });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a topping by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const topping = await getToppingById(req.params.id);
    res.status(200).json({ message: "Request successful", data: topping });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all toppings
 */
router.get("/", async (req, res) => {
  try {
    const toppings = await getAllToppings();
    res.status(200).json({ message: "Request successful", data: toppings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update a topping by ID
 */
router.patch("/:id", async (req, res) => {
  try {
    const updatedTopping = await updateTopping(req.params.id, req.body);
    res.status(200).json({ message: "Topping updated successfully", data: updatedTopping });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a topping by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedTopping = await deleteTopping(req.params.id);
    res.status(200).json({ message: `Topping '${deletedTopping._id}' successfully deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
