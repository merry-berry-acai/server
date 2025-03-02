const Stripe = require("stripe");
require("dotenv").config(); // Load environment variables

// Initialize Stripe with the secret key from `.env`
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    /**
     * Create a Payment Intent for processing payment
     * @param {number} amount - Amount in cents (Stripe requires amount in cents)
     * @param {string} currency - Default in AUD
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

}

module.exports = { StripeService };
