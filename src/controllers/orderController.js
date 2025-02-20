const { Order } = require("../models/OrderModel");
const { Item } = require("../models/MenuItemModel");
const { Topping } = require("../models/ToppingModel");
const mongoose = require("mongoose");

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
                        console.log(`Topping ID: ${topping._id}, Name: ${topping.name}, Price: ${topping.price}`);
                        orderToppingTotal += topping.price; // Add to total toppings price
                        return { _id: topping._id, name: topping.name, price: topping.price };
                    }
                    return null;
                }).filter(t => t !== null);
            });

            console.log("Total Toppings Price for this order:", orderToppingTotal);
        } catch (error) {
            console.error("❌ Error retrieving topping prices:", error);
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
            console.error("❌ Error retrieving products prices:", error);
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
            .populate("toppings");
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
        // Extract new product & topping IDs if items or toppings are being updated
        if (updateData.items || updateData.toppings) {
            const productIds = updateData.items ? updateData.items.map(item => item.product) : [];
            const toppingIds = updateData.toppings || [];

            // Fetch updated product & topping details
            const products = productIds.length > 0 ? await Item.find({ _id: { $in: productIds } }) : [];
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
