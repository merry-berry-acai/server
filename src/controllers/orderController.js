const { Order } = require("../models/Order");

async function createOrder(userId, items, totalAmount, specialInstructions = "", orderStatus = null) {
    try {
        const newOrder = new Order({
            userId,
            items,
            totalAmount,
            specialInstructions,
            orderStatus,
        });

        await newOrder.save();
        return newOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order");
    }
}

async function getOrderById(orderId) {
    try {
        const order = await Order.findById(orderId).populate("userId").populate("items.itemId").populate("items.toppings").populate("orderStatus");
        if (!order) throw new Error("Order not found");
        return order;
    } catch (error) {
        console.error("Error fetching order:", error);
        throw new Error("Failed to fetch order");
    }
}

async function getAllOrders() {
    try {
        return await Order.find().populate("userId").populate("items.itemId").populate("items.toppings").populate("orderStatus");
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
    }
}

async function updateOrder(orderId, updateData) {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true }).populate("userId").populate("items.itemId").populate("items.toppings").populate("orderStatus");
        if (!updatedOrder) throw new Error("Order not found or update failed");
        return updatedOrder;
    } catch (error) {
        console.error("Error updating order:", error);
        throw new Error("Failed to update order");
    }
}

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