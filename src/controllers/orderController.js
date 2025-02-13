const { Order } = require("../models/OrderModel");

/**
 * Create a new order
 */
async function createOrder(userId, items, totalAmount, specialInstructions = "") {
    try {
        const newOrder = new Order({
            user: userId,
            items,
            totalPrice: totalAmount, 
            specialInstructions,
        });

        await newOrder.save();
        return newOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order");
    }
}

/**
 * Get order by ID
 */
async function getOrderById(orderId) {
    try {
        const order = await Order.findById(orderId)
            .populate("user") 
            .populate("items.product")
            .populate("items.toppings"); // Assuming `toppings` exist

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
            .populate("user") 
            .populate("items.product") 
            .populate("items.toppings"); // Assuming toppings exist
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
    }
}

/**
 * Update an order
 */
async function updateOrder(orderId, updateData) {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
            .populate("user") 
            .populate("items.product") 
            .populate("items.toppings");

        if (!updatedOrder) throw new Error("Order not found or update failed");
        return updatedOrder;
    } catch (error) {
        console.error("Error updating order:", error);
        throw new Error("Failed to update order");
    }
}

/**
 * Delete an order
 */
async function deleteOrder(orderId) {
    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) throw new Error("Order not found or already deleted");
        return deletedOrder;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw new Error("Failed to delete order");
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrder,
    deleteOrder,
};
