const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be number or string (percentage or amount)
    startDate: { type: Date, required: true },   
    endDate: { type: Date, required: true },    
    minOrderAmount: { type: Number, default: 0 },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
}, {
    timestamps: true
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = { PromoCode };
