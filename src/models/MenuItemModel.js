const mongoose = require('mongoose');

// Array of strings containing valid categories
const ITEM_CATEGORIES = ['smoothie', 'akai', 'juice'];

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, default: "" }, 
    basePrice: { type: Number, required: true },
    category: {
        type: String,  
        enum: ITEM_CATEGORIES, // Ensures only valid categories are used
        required: true,
    },
    availability: { type: Boolean, default: true },
}, {
    timestamps: true // Enables createdAt and updatedAt fields
});

const Item = mongoose.model('MenuItem', itemSchema);

module.exports = { Item };