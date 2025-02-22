const { Order } = require("../models/OrderModel");
const { Item } = require("../models/MenuItemModel");
const { Topping } = require("../models/ToppingModel");
const mongoose = require("mongoose");
const { User } = require("../models/UserModel");

/**
 * Create a new order
 */
async function createOrder(userId, items, specialInstructions = "") {
    try {
        let totalPrice = 0;
        let orderToppingTotal = 0; // Stores total toppings price for the whole order
        let orderProductsTotal = 0;

        try {


            // Extract all topping IDs from items
            const toppingIds = items.flatMap(item => item.toppings).filter(id => id);



            let toppingDetails = [];
            if (toppingIds.length > 0) {
                // Fetch toppings from the database
                toppingDetails = await Topping.find({ _id: { $in: toppingIds } }, "_id name price");
            }

            // Iterate through items and retrieve each topping price
            items.forEach(item => {
                if (!Array.isArray(item.toppings)) {
                    item.toppings = []; // Ensure toppings is always an array
                }

                item.toppings = item.toppings.map(toppingId => {
                    const topping = toppingDetails.find(t => t._id.equals(toppingId));
                    if (topping) {
                        console.log(`Topping ID: ${topping._id}, Name: ${topping.name}, Price: $${topping.price}`);
                        orderToppingTotal += topping.price; // Add to total toppings price
                        return { _id: topping._id, name: topping.name, price: topping.price };
                    }
                    return null;
                }).filter(t => t !== null);
            });

            console.log("Total Toppings Price for this order: $",orderToppingTotal);
        } catch (error) {
            console.error("Error retrieving topping prices:", error);
            throw new Error("Internal server error");
        }



        //RETRIEVING PRODUCTS IDS
        try {

            let productDetails = [];
            const productsIds = items
                .flatMap(item => item.product)
                .filter(id => id);


            if (productsIds.length > 0) {
                productDetails = await Item.find({ _id: { $in: productsIds } }, "_id name basePrice");
            }


            // Iterate through items and retrieve each product price
            await Promise.all(items.map(async (item) => {
                try {
                    // Ensure item.product is a valid ObjectId
                    if (mongoose.Types.ObjectId.isValid(item.product)) {
                        // Fetch product details asynchronously
                        const product = await Item.findById(item.product);

                        if (product) {
                            // Calculate total price for the product
                            const productTotal = product.basePrice * item.quantity;

                            // Log the price of each product (product's base price and total)
                            console.log(`Product: ${product.name}, Price: $${product.basePrice}, Quantity: ${item.quantity}, Total: $${productTotal}`);

                            // Accumulate the total price
                            orderProductsTotal += productTotal;
                        } else {
                            console.error(`Product not found for id: ${item.product}`);
                        }
                    } else {
                        console.error(`Invalid product id: ${item.product}`);
                    }
                } catch (err) {
                    console.error(`Error retrieving product with id ${item.product}:`, err);
                }
            }));

            // Log the total price of the order
            console.log(`Total price of all items: $${orderProductsTotal}`);



        } catch (error) {
            console.error("Error retrieving products prices:", error);
            throw new Error("Internal server error");
        }

        totalPrice = orderProductsTotal + orderToppingTotal;
        console.log("Total price including item and topping is: $",totalPrice);



        const newOrder = new Order({
            user: userId,
            items,
            totalPrice: totalPrice,
            specialInstructions
        });

        await newOrder.save();

        // Add order to `orderHistory` in User model
        await User.findByIdAndUpdate(
            userId,
            { $push: { orderHistory: newOrder._id } }, // Push order ID to history
            { new: true }
        );

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
    const ORDER_STATUSES = ["Pending", "Processing", "Delivered", "Cancelled"];
    
    try {
        orderId = orderId.trim();

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new Error(`Invalid ObjectId: ${orderId}`);
        }

        if (!ORDER_STATUSES.includes(newStatus)) {
            throw new Error(`Invalid order status: ${newStatus}. Must be one of: ${ORDER_STATUSES.join(", ")}`);
        }


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
    updateOrderStatus,
    deleteOrder,
};
