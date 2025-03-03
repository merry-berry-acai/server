const express = require("express");
const router = express.Router();
const { StripeService } = require("../services/stripeService");
const { asyncHandler } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const { storeSuccessfulPayment } = require("../controllers/paymentController");
const { ObjectId } = require("mongodb");


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

router.post("/payment/store", async (req, res) => {
    try {
        let { paymentIntent, orderId } = req.body;



        if (!paymentIntent || !paymentIntent.id) {
            console.error("Payment intent data is required");
            return res.status(400).json({ error: "Payment intent data is required" });
        }

        const response = await storeSuccessfulPayment(paymentIntent, orderId);

        console.log(response.message);
        res.status(response.status).json(response);

    } catch (error) {
        console.error("Error storing payment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
