const express = require("express");
const router = express.Router();
const { validateOrderStatus } = require("../middlewares/validateOrderStatus");
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");


/**
 * Create a new order
 */
router.post("/new", async (req, res) => {
  try {
    const { userId, items, specialInstructions = "" } = req.body;
    const newOrder = await createOrder(userId, items, specialInstructions);
    res.status(201).json({ message: "Order created successfully", data: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get an order by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    res.status(200).json({ message: "Request successful", data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all orders
 */
router.get("/", async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json({ message: "Request successful", data: orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * Update order status
 */
router.patch("/:id/status", validateOrderStatus, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const updatedOrder = await updateOrderStatus(req.params.id, orderStatus);
    res.status(200).json({ message: "Order status updated successfully", data: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete an order by ID
 */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deletedOrder = await deleteOrder(req.params.id);
//     res.status(200).json({ message: `Order '${deletedOrder._id}' successfully deleted.` });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
