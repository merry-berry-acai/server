const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountAmount: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = { PromoCode };
