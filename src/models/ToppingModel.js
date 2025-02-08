const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
}, {
    timestamps: true
});

const Topping = mongoose.model('Topping', toppingSchema);

module.exports = { Topping };
