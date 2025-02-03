const mongoose = require("mongoose");

const shoppingCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const ShoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);

module.exports = { ShoppingCart };