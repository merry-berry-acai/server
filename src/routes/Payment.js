const express = require("express");
const router = express.Router();
const Logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const {
    isStripeEnabled,
    createPaymentIntent,
    StripeServiceError,
} = require("../services/stripeService");
const { validateRequiredFields } = require("../middlewares/validate");
const { storeSuccessfulPayment } = require("../controllers/paymentController");

// Route to create a payment intent
router.post("/payment", async (req, res) => {
    try {
        console.log("Payment route hit, amount:", req.body.amount); // Log request start

        // Check if Stripe is enabled
        if (!isStripeEnabled()) {
            Logger.warn("Payment attempt when Stripe is disabled");
            return sendError(
                res,
                "Payment processing is currently unavailable",
                503,
                null,
                "PAYMENT_SERVICE_UNAVAILABLE"
            );
        }

        // Process the payment
        const { amount, currency = "aud", paymentMethodType = "card" } = req.body;

        if (!amount) {
            return sendError(res, "Amount is required", 400, null, "MISSING_AMOUNT");
        }

        const paymentIntent = await createPaymentIntent({
            amount,
            currency,
            payment_method_types: [paymentMethodType],
        });

        console.log("Payment intent object:", paymentIntent); // Log paymentIntent object

        Logger.info(`Payment intent created: ${paymentIntent.id}`, {
            amount,
            currency,
            paymentMethodType,
        });

        const successResponse = { clientSecret: paymentIntent.client_secret };
        console.log("Success response body:", successResponse); // Log success response body

        console.log("PAYMENT INTENT:", paymentIntent);

        return sendSuccess(
            res,
            successResponse,
            "Payment intent created"
        );
    } catch (error) {
        console.error("Error in /payment route:", error); // More specific error log
        if (error instanceof StripeServiceError) {
            return sendError(res, error.message, 503, null, error.code);
        }

        Logger.error("Error creating payment intent", error);
        return sendError(
            res,
            "Failed to process payment",
            500,
            null,
            "PAYMENT_PROCESSING_ERROR"
        );
    }
});

router.post("/payment/store", 
    validateRequiredFields(["paymentIntent"]), 
    async (req, res) => {
    try {
        let { paymentIntent, orderId } = req.body;


        const response = await storeSuccessfulPayment(paymentIntent, orderId);

        console.log(response.message);
        // If response status is not defined, handle error
        if (!response.status) {
            console.error("Missing status code in the response:", response);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(response.status).json(response);
    } catch (error) {
        console.error("Error storing payment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
