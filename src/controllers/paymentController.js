const Order = require("../models/OrderModel");
const { Payment } = require("../models/PaymentModel");
const Logger = require("../utils/logger");

async function storeSuccessfulPayment(paymentIntent, orderId) {
    try {
        if (!paymentIntent || !paymentIntent.id) {
            console.error("Error: Payment intent data is missing or invalid");
            return { status: 400, error: "Invalid payment intent data" };
        }

        console.log("Storing Payment Intent:", paymentIntent);

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
        if (existingPayment) {
            console.warn("Payment intent already exists, skipping insert.");
            return { status: 409, message: "Duplicate payment detected" };
        }


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

        // Prepare the new order status based on the payment intent status
        const newStatus = paymentIntent.status === "succeeded" ? "paid" : "cancelled";

        // Update the order status using findByIdAndUpdate
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: newStatus },
            { new: true }
        );

        Logger.info(`Order ${orderId} updated to ${updatedOrder.status}`);

        return { 
            status: 201, 
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