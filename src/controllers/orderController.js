const { Order } = require("../models/OrderModel");
const { MenuItem } = require("../models/MenuItemModel");
const { Topping } = require("../models/ToppingModel");

/**
 * Create a new order
 */
async function createOrder(userId, items, toppings = [], specialInstructions = "") {
    try {
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            throw new Error("Invalid request: user and items are required.");
        }

        let totalPrice = 0;
        
        // for (const item of items) {
        //     const menuItem = await MenuItem.findById(item.product._id);
        //     if (!menuItem) {
        //         throw new Error(`Menu item with ID ${item.product} not found.`);
        //     }

        //     totalPrice += menuItem.price * item.quantity;
        // }

        // if (toppings.length > 0) {
        //     for (const toppingId of toppings) {
        //         const topping = await Topping.findById(toppingId);
        //         if (!topping) {
        //             throw new Error(`Topping with ID ${toppingId} not found.`);
        //         }
        //         totalPrice += topping.price;
        //     }
        //}

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
        throw new Error("Internal server error");
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
            .populate("toppings");

        if (!order) throw new Error("Order not found");
        return order;
    } catch (error) {
        console.error("❌ Error fetching order:", error);
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
            .populate("toppings");
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
    }
}

/**
 * Update an order
 */
async function updateOrder(orderId, updateData) {
    try {
        // Extract new product & topping IDs if items or toppings are being updated
        if (updateData.items || updateData.toppings) {
            const productIds = updateData.items ? updateData.items.map(item => item.product) : [];
            const toppingIds = updateData.toppings || [];

            // Fetch updated product & topping details
            const products = productIds.length > 0 ? await MenuItem.find({ _id: { $in: productIds } }) : [];
            const toppings = toppingIds.length > 0 ? await Topping.find({ _id: { $in: toppingIds } }) : [];

            // Validate products
            if (productIds.length > 0 && products.length !== productIds.length) {
                throw new Error("One or more products not found.");
            }

            // Validate toppings
            if (toppingIds.length > 0 && toppings.length !== toppingIds.length) {
                throw new Error("One or more toppings not found.");
            }

            // Recalculate total price if items or toppings were updated
            let totalPrice = 0;
            if (updateData.items) {
                totalPrice = updateData.items.reduce((sum, item) => {
                    const product = products.find(p => p._id.toString() === item.product.toString());
                    if (!product) throw new Error(`Product with ID ${item.product} not found`);
                    return sum + product.basePrice * Math.max(1, item.quantity);
                }, 0);
            }

            if (updateData.toppings) {
                totalPrice += toppings.reduce((sum, topping) => sum + topping.price, 0);
            }

            updateData.totalPrice = totalPrice;
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
            .populate("user")
            .populate("items.product")
            .populate("toppings");

        if (!updatedOrder) throw new Error("Order not found or update failed");
        return updatedOrder;
    } catch (error) {
        console.error("❌ Error updating order:", error);
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
        console.error("❌ Error deleting order:", error);
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
