const express = require("express");
const router = express.Router();
const { validateOrderStatus } = require("../middlewares/validateOrderStatus");
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const {
    checkUserId,
    checkUserFirebaseUid,
} = require("../middlewares/checkUser");
const {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} = require("../controllers/orderController");
const { checkAdminRole } = require("../middlewares/checkAdminRole");

/**
 * Create a new order
 */

// Apply `checkUser` middleware before creating an order
router.post(
    "/new",
    validateRequiredFields(["items", "totalPrice"]), // Require `uid` and `items`
    checkUserFirebaseUid, // Extract Firebase Uid from the header
    checkUserId, // Middleware to validate user through Firebase and attach `userId` to the request ==> req.userId
    asyncHandler(async (req, res) => {

        const { items, totalPrice, specialInstructions = "" } = req.body;

        const orderResult = await createOrder(
            req.userId,
            items,
            totalPrice,
            specialInstructions
        );

        if (orderResult.error) {
            return res.status(orderResult.status || 400).json({
                error: orderResult.message,
                details: orderResult.details,
                code: orderResult.code,
            });
        }

        return sendSuccess(
            res,
            orderResult.order,
            "Order placed successfully",
            201
        );
    })
);

/**
 * Get an order by ID
 */
router.get(
    "/:id",
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        const order = await getOrderById(req.params.id);
        sendSuccess(res, order);
    })
);

/**
 * Get all orders
 */
router.get(
    "/",
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        const orders = await getAllOrders();
        sendSuccess(res, orders);
    })
);

/**
 * Update order status
 */
router.patch(
    "/:id/status",
    validateRequiredFields(["orderStatus"]),
    checkUserFirebaseUid,
    checkAdminRole,
    validateOrderStatus,
    asyncHandler(async (req, res, next) => {
        try {
            const { orderStatus } = req.body;
            const updatedOrder = await updateOrderStatus(req.params.id, orderStatus);

            if (!updatedOrder) {
                return res
                    .status(404)
                    .json({ status: "error", message: "Order not found" });
            }

            sendSuccess(res, updatedOrder, "Order status updated successfully");
        } catch (error) {
            next(error);
        }
    })
);

module.exports = router;
