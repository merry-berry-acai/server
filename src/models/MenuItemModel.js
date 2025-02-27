const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, default: "https://merry-berry.onrender.com/images/item-default.jpg" }, 
    basePrice: { type: Number, required: true },
    toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topping' }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    availability: { type: Boolean, default: true },
}, {
    timestamps: true // Enables createdAt and updatedAt fields
});

const Item = mongoose.model('MenuItem', itemSchema);

module.exports = { Item };
