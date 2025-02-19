const { Order } = require("../models/OrderModel");
const { MenuItem } = require("../models/MenuItemModel");
const { Topping } = require("../models/ToppingModel");

/**
 * Create a new order
 */
async function createOrder(userId, items, specialInstructions = "") {
    try {
        // Extract product & topping IDs
        const productIds = items.map(item => item.product);
        const toppingIds = items.flatMap(item => item.toppings || []);

        // Fetch product & topping details
        const products = await MenuItem.find({ _id: { $in: productIds } });
        const toppings = await Topping.find({ _id: { $in: toppingIds } });

        if (products.length !== productIds.length) throw new Error("One or more products not found");
        if (toppings.length !== toppingIds.length && toppingIds.length > 0) throw new Error("One or more toppings not found");

        // Calculate total price dynamically
        let totalPrice = 0;
        items.forEach(item => {
            const product = products.find(p => p._id.toString() === item.product.toString());
            totalPrice += product.basePrice * Math.max(1, item.quantity); // Ensure min quantity is 1

            // Add topping prices (if any)
            item.toppings?.forEach(toppingId => {
                const topping = toppings.find(t => t._id.toString() === toppingId.toString());
                if (topping) totalPrice += topping.price;
            });
        });

        // Create & save order
        const newOrder = new Order({
            user: userId,
            items,
            totalPrice,
            specialInstructions,
        });

        await newOrder.save();
        return newOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error(error.message || "Failed to create order");
    }
}

/**
 * Get order by ID (with populated fields)
 */
async function getOrderById(orderId) {
    try {
        const order = await Order.findById(orderId)
            .populate("user")
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
            .populate("user")
            .populate("items.product")
            .populate("items.toppings");
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
        // If items are updated, recalculate total price
        if (updateData.items) {
            const productIds = updateData.items.map(item => item.product);
            const toppingIds = updateData.items.flatMap(item => item.toppings || []);

            const products = await MenuItem.find({ _id: { $in: productIds } });
            const toppings = await Topping.find({ _id: { $in: toppingIds } });

            if (products.length !== productIds.length) throw new Error("One or more products not found");
            if (toppings.length !== toppingIds.length && toppingIds.length > 0) throw new Error("One or more toppings not found");

            let totalPrice = 0;
            updateData.items.forEach(item => {
                const product = products.find(p => p._id.toString() === item.product.toString());
                totalPrice += product.basePrice * Math.max(1, item.quantity);

                item.toppings?.forEach(toppingId => {
                    const topping = toppings.find(t => t._id.toString() === toppingId.toString());
                    if (topping) totalPrice += topping.price;
                });
            });

            updateData.totalPrice = totalPrice;
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
            .populate("user")
            .populate("items.product")
            .populate("items.toppings");

        if (!updatedOrder) throw new Error("Order not found or update failed");
        return updatedOrder;
    } catch (error) {
        console.error("Error updating order:", error);
        throw new Error(error.message || "Failed to update order");
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
