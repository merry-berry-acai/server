const mongoose = require("mongoose");

// samples of toppings and addOns
const toppingsList = ["Chia Seeds", "Almonds", "Granola"];
const addInsList = ["Protein Powder", "Honey", "Flax Seeds"];

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            menuItemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MenuItem",
                required: true,
            },
            size: {
                type: String,
                enum: ["Small", "Medium", "Large"],
                required: true,
            },
            toppings: {
                type: [String],
                enum: toppingsList,
                default: [],
            },
            addIns: {
                type: [String],
                enum: addInsList,
                default: [],
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Completed", "Cancelled"],
        default: "Pending",
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    deliveryTime: {
        type: Date,
    },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = {
    Order
};