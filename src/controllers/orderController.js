const { Order } = require("../models/OrderModel");

async function createOrder(
  userId,
  items,
  totalAmount,
  deliveryAddress,
  deliveryTime = null
) {
  try {
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      deliveryAddress,
      deliveryTime,
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
    const order = await Order.findById(orderId)
      .populate("userId")
      .populate("items.menuItemId");
    if (!order) throw new Error("Order not found");
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Failed to fetch order");
  }
}

async function getOrdersByUser(userId) {
  try {
    const orders = await Order.find({ userId }).populate("items.menuItemId");
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch user orders");
  }
}

async function getAllOrders() {
  try {
    return await Order.find().populate("userId").populate("items.menuItemId");
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

async function updateOrder(orderId, updateData) {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });
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
  getOrdersByUser,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
