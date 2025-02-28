const express = require("express");
const router = express.Router();
const { validateOrderStatus } = require("../middlewares/validateOrderStatus");
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
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
router.post("/new", 
  validateRequiredFields(['userId', 'items']),
  asyncHandler(async (req, res) => {
    const { userId, items, specialInstructions = "" } = req.body;
    const newOrder = await createOrder(userId, items, specialInstructions);
    sendSuccess(res, newOrder, "Order created successfully", 201);
  })
);

/**
 * Get an order by ID
 */
router.get("/:id", 
  asyncHandler(async (req, res) => {
    const order = await getOrderById(req.params.id);
    sendSuccess(res, order);
  })
);

/**
 * Get all orders
 */
router.get("/", 
  asyncHandler(async (req, res) => {
    const orders = await getAllOrders();
    sendSuccess(res, orders);
  })
);

/**
 * Update order status
 */
router.patch("/:id/status", 
  validateOrderStatus, 
  asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;
    const updatedOrder = await updateOrderStatus(req.params.id, orderStatus);
    sendSuccess(res, updatedOrder, "Order status updated successfully");
  })
);

/**
 * Delete an order by ID (currently commented out)
 */
// router.delete("/:id", 
//   asyncHandler(async (req, res) => {
//     const deletedOrder = await deleteOrder(req.params.id);
//     sendSuccess(res, { id: deletedOrder._id }, `Order '${deletedOrder._id}' successfully deleted`);
//   })
// );

module.exports = router;
