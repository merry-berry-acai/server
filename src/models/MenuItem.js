const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {       //we can link the url image
    type: String,
  },
  category: {
    type: String,
    enum: ['smoothie', 'acai', 'bowl'],
    required: true,
  },
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = {
    MenuItem
};