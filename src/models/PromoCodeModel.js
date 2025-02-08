const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        discount: { type: Number, required: true }, // Percentage discount
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true, validate: [dateValidator, "End date must be after start date"] },    
        minOrderAmount: { type: Number, default: 0 },
        applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    },
    { timestamps: true }
);

// Validator function to ensure endDate is after startDate
function dateValidator(value) {
    return this.startDate < value;
}

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = { PromoCode };
