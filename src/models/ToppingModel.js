const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, default: 0, min: 0 },
    availability: { type: Boolean, default: true },
});

const Topping = mongoose.model('Topping', toppingSchema);

module.exports = { Topping };
