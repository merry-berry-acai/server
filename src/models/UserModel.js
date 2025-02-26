const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    email: {
        type: String,
    },

    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    admin: { type: Boolean, default: false }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
