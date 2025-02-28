const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    displayName: { type: String, required: true },
    email: {
        type: String,
    },
    photoURL: { type: String },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    role: { type: String, default: 'user' },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
