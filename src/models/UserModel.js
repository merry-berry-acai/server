const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic regex for email validation
    },
    password: { type: String, required: true },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    userRole: { type: String, enum: ['customer', 'shop owner'], required: true },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
