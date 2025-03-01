const Stripe = require("stripe");
require("dotenv").config(); // Load environment variables

// Initialize Stripe with the secret key from `.env`
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    /**
     * Create a Payment Intent for processing payment
     * @param {number} amount - Amount in cents (Stripe requires amount in cents)
     * @param {string} currency - Default is USD
     */
    static async createPaymentIntent(amount, currency) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                payment_method_types: ["card"], // Accepts credit/debit cards
            });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error("Error creating Payment Intent:", error);
            return { success: false, error: error.message };
        }
    }

//     /**
//      * Charge the customer immediately using a Payment Method ID
//      * @param {string} paymentMethodId - The Payment Method ID from the frontend
//      * @param {number} amount - Amount in cents
//      * @param {string} currency - Default AUD
//      */
//     static async chargeCustomer(paymentMethodId, amount, currency = "AUD") {
//         try {
//             const paymentIntent = await stripe.paymentIntents.create({
//                 amount,
//                 currency,
//                 payment_method: paymentMethodId,
//                 confirm: true, // Auto-confirm payment
//             });

//             return paymentIntent.status === "succeeded"
//                 ? { success: true, transactionId: paymentIntent.id }
//                 : { success: false, error: "Payment not completed" };
//         } catch (error) {
//             console.error("Error charging customer:", error);
//             return { success: false, error: error.message };
//         }
//     }
}

module.exports = { StripeService };
