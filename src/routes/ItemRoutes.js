const express = require("express");
const router = express.Router();
const {
  createMenuItem,
  getMenuItemById,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuItemController");



// Create a new menu item
router.post("/new", async (req, res) => {
  try {
    const { name, description, basePrice, category, imageUrl } = req.body;
    const newItem = await createMenuItem(name, description, basePrice, category, imageUrl);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get a menu item by ID
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await getMenuItemById(req.params.id);
    res.status(200).json({ message: "Request successful", data: menuItem });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});



// Get all menu items
router.get("/", async (req, res) => {
  try {
    const menuItems = await getAllMenuItems();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Update a menu item by ID
router.patch("/:id", async (req, res) => {
  try {
    const updatedItem = await updateMenuItem(req.params.id, req.body);
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Delete a menu item by ID
router.delete("/:id", async (req, res) => {
  try {
    // get the item name first
    const deletedItem = await getMenuItemById(req.params.id);
    await deleteMenuItem(req.params.id);
    res.status(200).json({ message: `Menu item '${deletedItem.name}' successfully deleted` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
