const mongoose = require('mongoose');

//Array of string containing the categories
ITEM_CATEGORIES = ['smoothie', 'akai', 'juice'];

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageURL: { type: String },
    basePrice: { type: Number, required: true },
    category: {
        type: [String],  // Array of strings
        enum: ITEM_CATEGORIES,
        required: true,
    },
    availability: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
}, {
    timestamps: true        //Created at and updated at
});

const Item = mongoose.model('MenuItem', itemSchema);

module.exports = { Item };
