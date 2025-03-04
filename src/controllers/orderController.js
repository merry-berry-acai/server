const { Order } = require("../models/OrderModel");
const { User } = require("../models/UserModel");


/**
 * Create a new order.
 * If an item or topping is missing, DO NOT create the order and return an error response.
 */
async function createOrder(userId, items, totalPrice, specialInstructions = "") {
    try {
        //price is calculated in the frontend

        const priceResult = totalPrice;

        if (priceResult.error) {
            return { error: true, status: priceResult.status, message: priceResult.message };
        }

        const newOrder = new Order({
            user: userId,
            items,
            totalPrice: priceResult.totalPrice,
            specialInstructions
        });

        await newOrder.save();

        if (userId != null) {
            // Add order Id to `orderHistory` in User model
            await User.findByIdAndUpdate(
                userId,
                { $push: { orderHistory: newOrder._id } },
                { new: true }
            );
        }

        return { error: false, order: newOrder };
    } catch (error) {
        console.error("Error creating order:", error);
        return { error: true, status: 500, message: "Internal server error" };
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
