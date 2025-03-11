const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        uid: { type: String, required: true, unique: true }, // Firebase UID
        displayName: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
                "Please provide a valid email address",
            ],
        },

        photoURL: { type: String, default: "" },
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
        role: {
            type: String,
            enum: ["user", "admin"], // Only allow "user" or "admin"
            default: "user"
        },
    }, {
    timestamps: true
});


const User = mongoose.model("User", userSchema);

module.exports = { User };
