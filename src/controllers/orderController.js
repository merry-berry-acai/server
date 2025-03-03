const { Order } = require("../models/OrderModel");
const { Item } = require("../models/MenuItemModel");
const { Topping } = require("../models/ToppingModel");
const mongoose = require("mongoose");
const { User } = require("../models/UserModel");


/**
 * Calculate the order's total price.
 * If an item or topping is missing, return an error with status code.
 */
async function totalPrice(items) {
    let totalPrice = 0;
    let orderToppingTotal = 0;
    let orderProductsTotal = 0;
    let errors = []; // Collects all errors instead of stopping execution

    try {
        // Extract all topping IDs from items
        const toppingIds = items.flatMap(item => item.toppings).filter(id => id);
        let toppingDetails = [];

        if (toppingIds.length > 0) {
            // Fetch toppings from the database
            toppingDetails = await Topping.find({ _id: { $in: toppingIds } }, "_id name price");

            // Check for missing toppings
            const foundToppingIds = toppingDetails.map(t => t._id.toString());
            const missingToppings = toppingIds.filter(id => !foundToppingIds.includes(id.toString()));

            if (missingToppings.length > 0) {
                errors.push(`Toppings not found: ${missingToppings.join(", ")}`);
            }
        }

        // Calculate total price for toppings
        items.forEach(item => {
            if (!Array.isArray(item.toppings)) {
                item.toppings = [];
            }

            item.toppings = item.toppings.map(toppingId => {
                const topping = toppingDetails.find(t => t._id.equals(toppingId));
                if (topping) {
                    orderToppingTotal += (topping.price * item.quantity);
                    return { _id: topping._id, name: topping.name, price: topping.price };
                }
                return null;
            }).filter(t => t !== null);
        });

        console.log("Total TOPPINGS Price: $", orderToppingTotal);
    } catch (error) {
        console.error("Error retrieving topping prices:", error);
        return { error: true, status: 500, message: "Internal server error" };
    }

    // Retrieve product details
    try {
        let productDetails = [];
        const productsIds = items.map(item => item.product).filter(id => id);

        if (productsIds.length > 0) {
            productDetails = await Item.find({ _id: { $in: productsIds } }, "_id name basePrice");

            // Check for missing products
            const foundProductIds = productDetails.map(p => p._id.toString());
            const missingProducts = productsIds.filter(id => !foundProductIds.includes(id.toString()));

            if (missingProducts.length > 0) {
                errors.push(`Products not found: ${missingProducts.join(", ")}`);
            }
        }

        // Calculate total price for items
        for (const item of items) {
            try {
                if (!mongoose.Types.ObjectId.isValid(item.product)) {
                    errors.push(`Invalid product ID: ${item.product}`);
                    continue;
                }

                const product = await Item.findById(item.product);

                if (product) {
                    const productTotal = product.basePrice * item.quantity;
                    orderProductsTotal += productTotal;
                }
            } catch (err) {
                console.error(`Error retrieving product with ID ${item.product}:`, err);
                return { error: true, status: 500, message: "Internal server error" };
            }
        }

        console.log(`Total ITEMS price: $${orderProductsTotal}`);

    } catch (error) {
        console.error("Error retrieving product prices:", error);
        return { error: true, status: 500, message: "Internal server error" };
    }

    if (errors.length > 0) {
        return { error: true, status: 404, message: errors.join(" | ") };
    }

    totalPrice = orderProductsTotal + orderToppingTotal;
    console.log("Total ORDER including items and toppings is: $", totalPrice);

    return { error: false, totalPrice };
}

/**
 * Create a new order.
 * If an item or topping is missing, DO NOT create the order and return an error response.
 */
async function createOrder(userId, items, totalPrice, specialInstructions = "") {
    try {
        //const priceResult = await totalPrice(items);

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

        // Add order to `orderHistory` in User model
        await User.findByIdAndUpdate(
            userId,
            { $push: { orderHistory: newOrder._id } },
            { new: true }
        );

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
