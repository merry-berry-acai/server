const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderDate: { type: Date, default: Date.now },
    orderStatus: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderStatus' },
    items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        quantity: { type: Number, required: true },
        toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topping' }],
    }],
    totalAmount: { type: Number, required: true },
    specialInstructions: { type: String },
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
