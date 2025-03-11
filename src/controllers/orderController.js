const Order = require("../models/OrderModel");
const { User } = require("../models/UserModel");

/**
 * Create a new order.
 * Validates required fields and handles errors with descriptive messages.
 */
async function createOrder(
    userId,
    items,
    totalPrice,
    specialInstructions = ""
) {
    try {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return {
                error: true,
                status: 400,
                message: "Order must contain at least one item",
                code: "MISSING_ITEMS",
            };
        }

        // Check if totalPrice is provided and is a valid number
        if (totalPrice === undefined || totalPrice === null) {
            return {
                error: true,
                status: 400,
                message: "Total price is required",
                code: "MISSING_TOTAL_PRICE",
            };
        }

        // If totalPrice is an object with a totalPrice property, extract it
        const finalPrice =
            typeof totalPrice === "object" && totalPrice.totalPrice !== undefined
                ? totalPrice.totalPrice
                : totalPrice;

        // Validate that finalPrice is a number and is positive
        if (isNaN(finalPrice) || finalPrice <= 0) {
            return {
                error: true,
                status: 400,
                message: "Total price must be a positive number",
                code: "INVALID_TOTAL_PRICE",
            };
        }

        // Create and save the new order
        const newOrder = new Order({
            user: userId,
            items,
            totalPrice: finalPrice,
            status: "processing",  // Set the status to "processing" when creating the order
            specialInstructions: specialInstructions || "",
        });

        await newOrder.save();

        // Add order ID to user's order history
        if (userId) {
            await User.findByIdAndUpdate(
                userId,
                { $push: { orderHistory: newOrder._id } },
                { new: true }
            );
        }

        return {
            error: false,
            order: newOrder,
            message: "Order created successfully",
        };
    } catch (error) {
        console.error("Error creating order:", error);

        // Handle validation errors with descriptive messages
        if (error.name === "ValidationError") {
            const validationErrors = {};

            // Extract validation error details
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }

            return {
                error: true,
                status: 400,
                message: "Order validation failed",
                details: validationErrors,
                code: "VALIDATION_ERROR",
            };
        }

        // Handle other types of errors
        return {
            error: true,
            status: 500,
            message: "Failed to create order: " + (error.message || "Unknown error"),
            code: "ORDER_CREATION_FAILED",
        };
    }
}

/**
 * Get order by ID (with populated fields)
 */
async function getOrderById(orderId) {
    try {
        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("items.product")
            .populate("items.toppings");

        if (!order) throw new Error("Order not found");
        return order;
    } catch (error) {
        console.error("Error fetching order:", error);
        throw new Error("Failed to fetch order");
    }
}

/**
 * Get all orders
 */
async function getAllOrders() {
    try {
        return await Order.find()
            .populate("user", "name email")
            .populate("items.product", "name basePrice")
            .populate("items.toppings", "name price");
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
    }
}

/**
 * Update an order STATUS
 */

async function updateOrderStatus(orderId, newStatus) {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { orderStatus: newStatus },
            { new: true }
        );

        if (!updatedOrder) {
            throw new Error("Order not found.");
        }

        console.log("Order status updated successfully:", updatedOrder);
        return updatedOrder;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error(error.message || "Internal server error");
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
};
