const mongoose = require('mongoose');

const ORDER_STATUSES = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned",
];

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
                quantity: { type: Number, required: true },
            },
        ],
        totalPrice: { type: Number, required: true },
        orderStatus: {
            type: String,
            enum: ORDER_STATUSES, // Ensure only valid statuses are stored
            default: "Pending", // Default status when order is created
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
