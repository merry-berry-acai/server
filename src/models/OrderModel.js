const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    toppings: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Topping",
                required: false,
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },
        },
    ]
});

const OrderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        items: [OrderItemSchema],
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "paid", "cancelled"],
            default: "pending",
        },
        specialInstructions: {
            type: String,
            default: "",
            trim: true,
        }
    },

    {
        timestamps: true, // Add createdAt and updatedAt fields
    }
);

module.exports = mongoose.model("Order", OrderSchema);
