const express = require("express");
const router = express.Router();
const { StripeService } = require("../services/stripeService");
const { asyncHandler } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../middlewares/validate");


// Route: Checkout (Create Payment Intent)
router.post(
    "/payment",
    validateRequiredFields(["amount"]), // Require `amount`
    asyncHandler(async (req, res) => {
        const { amount, currency = "AUD" } = req.body;

        // Step 1: Create Payment Intent  (amount converted in cents for stripe)
        const paymentResult = await StripeService.createPaymentIntent(amount * 100, currency);

        if (!paymentResult.success) {
            return res.status(400).json({ error: paymentResult.error });
        }

        // Step 2: Return Payment Intent Client Secret
        res.status(201).json({
            message: "Payment intent created successfully",
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntentId
        });
    })
);

module.exports = router;
