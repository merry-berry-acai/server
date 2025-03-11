const Logger = require("../utils/logger");
require("dotenv").config(); // Load environment variables

// Check if Stripe API key exists
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripeClient = null;
let stripeEnabled = false;

// Create a custom error type for stripe-related errors
class StripeServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "StripeServiceError";
        this.code = "STRIPE_SERVICE_ERROR";
    }
}

try {
    if (!STRIPE_SECRET_KEY) {
        Logger.warn(
            "Stripe API key is missing! Stripe payment features will be disabled."
        );
        stripeEnabled = false;
    } else {
        // Only require and initialize Stripe if the API key is present
        const Stripe = require("stripe");
        stripeClient = new Stripe(STRIPE_SECRET_KEY);
        stripeEnabled = true;
        Logger.info("Stripe payment service initialized successfully");
    }
} catch (error) {
    Logger.error("Failed to initialize Stripe client", error);
    stripeEnabled = false;
}

/**
 * Mock implementation of Stripe service when API key is missing
 */
const mockStripeService = {
    createPaymentIntent: async () => {
        throw new StripeServiceError(
            "Stripe payments are disabled: Missing API key"
        );
    },

    retrievePaymentIntent: async () => {
        throw new StripeServiceError(
            "Stripe payments are disabled: Missing API key"
        );
    },

    constructEventFromPayload: async () => {
        throw new StripeServiceError(
            "Stripe payments are disabled: Missing API key"
        );
    },

    // Add mock implementations for other Stripe methods as needed
};

/**
 * Check if Stripe functionality is enabled
 */
const isStripeEnabled = () => stripeEnabled;

/**
 * Create a payment intent
 * @param {Object} options Payment options
 * @returns {Promise<Object>} The payment intent
 */
const createPaymentIntent = async (options) => {
    if (!stripeEnabled) {
        Logger.warn("Attempted to create payment intent while Stripe is disabled");
        throw new StripeServiceError("Stripe payments are currently disabled");
    }

    try {
        return await stripeClient.paymentIntents.create(options);
    } catch (error) {
        Logger.error("Error creating payment intent", error);
        throw error;
    }
};

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId The payment intent ID
 * @returns {Promise<Object>} The payment intent
 */
const retrievePaymentIntent = async (paymentIntentId) => {
    if (!stripeEnabled) {
        Logger.warn(
            `Attempted to retrieve payment intent ${paymentIntentId} while Stripe is disabled`
        );
        throw new StripeServiceError("Stripe payments are currently disabled");
    }

    try {
        return await stripeClient.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
        Logger.error(`Error retrieving payment intent ${paymentIntentId}`, error);
        throw error;
    }
};

/**
 * Construct event from webhook payload
 * @param {string} payload The webhook payload
 * @param {string} signature The Stripe signature
 * @param {string} webhookSecret The webhook secret
 * @returns {Object} The constructed event
 */
const constructEventFromPayload = (payload, signature, webhookSecret) => {
    if (!stripeEnabled) {
        Logger.warn("Attempted to construct Stripe event while Stripe is disabled");
        throw new StripeServiceError("Stripe payments are currently disabled");
    }

    try {
        return stripeClient.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );
    } catch (error) {
        Logger.error("Error constructing event from webhook payload", error);
        throw error;
    }
};

// Export the service functions
module.exports = {
    isStripeEnabled,
    createPaymentIntent,
    retrievePaymentIntent,
    constructEventFromPayload,
    StripeServiceError,
};
