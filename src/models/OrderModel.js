const mongoose = require('mongoose');

const ORDER_STATUSES = [
    "Pending",
    "Processing",
    "Delivered",
    "Cancelled",
];

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
                quantity: { type: Number, required: true, min: 1 },
                toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topping", default: [] }],
            },
        ],
        totalPrice: {
            type: Number,
            required: true
        },
        specialInstructions: {
            type: String,
            default: ""
        },
        orderStatus: {
            type: String,
            enum: ORDER_STATUSES, // Ensure only valid statuses are stored
            default: "Pending", // Default status when order is created
            required: false
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
