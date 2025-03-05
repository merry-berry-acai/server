const express = require("express");
const router = express.Router();
const Logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const {
  isStripeEnabled,
  createPaymentIntent,
  StripeServiceError,
} = require("../services/stripeService");
const { asyncHandler } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const { storeSuccessfulPayment } = require("../controllers/paymentController");

// Route to create a payment intent
router.post("/payment", async (req, res) => {
  try {
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

    Logger.info(`Payment intent created: ${paymentIntent.id}`, {
      amount,
      currency,
      paymentMethodType,
    });

    return sendSuccess(
      res,
      {
        clientSecret: paymentIntent.client_secret,
      },
      "Payment intent created"
    );
  } catch (error) {
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
