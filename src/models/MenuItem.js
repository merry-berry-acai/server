const mongoose = require('mongoose');

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
  timestamps: true
});

const Item = mongoose.model('MenuItem', itemSchema);

module.exports = { Item };
