const { Payment } = require("../models/PaymentModel");

async function storeSuccessfulPayment(paymentIntent, orderId) {
    try {
        if (!paymentIntent || !paymentIntent.id) {
            console.error("Error: Payment intent data is missing or invalid");
            return { status: 400, error: "Invalid payment intent data" };
        }

        console.log("Storing Payment Intent:", paymentIntent);



        // Extract relevant fields from paymentIntent
        const newPayment = new Payment({
            orderId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            paymentMethod: paymentIntent.payment_method,
            captureMethod: paymentIntent.capture_method,
            confirmationMethod: paymentIntent.confirmation_method,
            receiptEmail: paymentIntent.receipt_email || null,
            createdAt: new Date(paymentIntent.created * 1000) // Convert Stripe timestamp
        });

        // Save payment record to the database
        await newPayment.save();

        return { status: 201, 
            success: true, 
            message: "Payment stored successfully" };

    } catch (error) {
        console.error("Error storing payment intent:", error);
        return {
            success: false,
            message: "Failed to store payment intent",
            error: error.message
        };
    }
}

module.exports = { storeSuccessfulPayment };