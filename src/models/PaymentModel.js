const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Order",
        required: true
    },
    paymentIntentId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: "AUD"
    },
    status: {
        type: String,
        enum: ["succeeded", "failed", "pending", "requires_action"],
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    captureMethod: {
        type: String
    },
    confirmationMethod: {
        type: String
    },
    receiptEmail: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = { Payment };