const express = require("express");
const router = express.Router();
const { validateOrderStatus } = require("../middlewares/validateOrderStatus");
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const { checkUser } = require("../middlewares/checkUser");
const {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");



/**
 * Create a new order
 */

// Apply `checkUser` middleware before creating an order
router.post(
    "/new",
    validateRequiredFields(["uid", "items"]), // Require `uid` and `items`
    checkUser, // Middleware to validate user and attach `userId`
    asyncHandler(async (req, res) => {
        const { items, specialInstructions = "" } = req.body;

        // Use `req.userId` attached in middleware
        const newOrder = await createOrder(req.userId, items, specialInstructions);

        if (newOrder.error) {
            return res.status(newOrder.status).json({ error: newOrder.message });
        }

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

module.exports = router;
