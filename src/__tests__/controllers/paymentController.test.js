const {
  storeSuccessfulPayment,
} = require("../../controllers/paymentController");

// Mock the Payment model
jest.mock("../../models/PaymentModel", () => {
  const mockSave = jest.fn();
  const mockPayment = {
    save: mockSave,
    _id: "mock-payment-id",
    paymentIntentId: "pi_mock123",
    amount: 1099,
    currency: "aud",
    status: "succeeded",
    toObject: () => ({
      _id: "mock-payment-id",
      paymentIntentId: "pi_mock123",
      amount: 1099,
      currency: "aud",
      status: "succeeded",
    }),
  };

  return {
    Payment: jest.fn().mockImplementation(() => mockPayment),
  };
});

// Get the mocked model
const { Payment } = require("../../models/PaymentModel");

describe("Payment Controller", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("storeSuccessfulPayment", () => {
    it("should store a payment with valid data", async () => {
      // Arrange
      const mockPaymentIntent = {
        id: "pi_123456789",
        amount: 1599,
        currency: "aud",
        status: "succeeded",
        payment_method: "pm_card_visa",
        capture_method: "automatic",
        confirmation_method: "automatic",
        receipt_email: "customer@example.com",
        created: Math.floor(Date.now() / 1000), // Current time in seconds
      };

      const mockOrderId = "order_123456789";

      const mockPayment = {
        _id: "payment_id",
        orderId: mockOrderId,
        paymentIntentId: mockPaymentIntent.id,
        save: jest.fn().mockResolvedValue(true),
      };

      Payment.mockImplementation(() => mockPayment);

      // Act
      const result = await storeSuccessfulPayment(
        mockPaymentIntent,
        mockOrderId
      );

      // Assert
      expect(Payment).toHaveBeenCalledWith({
        orderId: mockOrderId,
        paymentIntentId: mockPaymentIntent.id,
        amount: mockPaymentIntent.amount,
        currency: mockPaymentIntent.currency,
        status: mockPaymentIntent.status,
        paymentMethod: mockPaymentIntent.payment_method,
        captureMethod: mockPaymentIntent.capture_method,
        confirmationMethod: mockPaymentIntent.confirmation_method,
        receiptEmail: mockPaymentIntent.receipt_email,
        createdAt: expect.any(Date),
      });
      expect(mockPayment.save).toHaveBeenCalled();
      expect(result.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Payment stored successfully");
    });

    it("should handle missing payment intent data", async () => {
      // Act
      const result = await storeSuccessfulPayment(null, "order_123456789");

      // Assert
      expect(result.status).toBe(400);
      expect(result.error).toBe("Invalid payment intent data");
    });

    it("should handle missing payment intent ID", async () => {
      // Arrange
      const invalidPaymentIntent = {
        amount: 1599,
        currency: "aud",
        status: "succeeded",
      };

      // Act
      const result = await storeSuccessfulPayment(
        invalidPaymentIntent,
        "order_123456789"
      );

      // Assert
      expect(result.status).toBe(400);
      expect(result.error).toBe("Invalid payment intent data");
    });

    it("should handle database errors", async () => {
      // Arrange
      const mockPaymentIntent = {
        id: "pi_123456789",
        amount: 1599,
        currency: "aud",
        status: "succeeded",
        payment_method: "pm_card_visa",
        created: Math.floor(Date.now() / 1000),
      };

      const mockError = new Error("Database error");

      const mockPayment = {
        save: jest.fn().mockRejectedValue(mockError),
      };

      Payment.mockImplementation(() => mockPayment);

      // Act
      const result = await storeSuccessfulPayment(
        mockPaymentIntent,
        "order_123456789"
      );

      // Assert
      expect(mockPayment.save).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to store payment intent");
      expect(result.error).toBe("Database error");
    });

    it("should handle payment intent with missing optional fields", async () => {
      // Arrange
      const mockPaymentIntent = {
        id: "pi_123456789",
        amount: 1599,
        currency: "aud",
        status: "succeeded",
        payment_method: "pm_card_visa",
        created: Math.floor(Date.now() / 1000),
        // Missing capture_method, confirmation_method, receipt_email
      };

      const mockOrderId = "order_123456789";

      const mockPayment = {
        _id: "payment_id",
        orderId: mockOrderId,
        paymentIntentId: mockPaymentIntent.id,
        save: jest.fn().mockResolvedValue(true),
      };

      Payment.mockImplementation(() => mockPayment);

      // Act
      const result = await storeSuccessfulPayment(
        mockPaymentIntent,
        mockOrderId
      );

      // Assert
      expect(Payment).toHaveBeenCalledWith({
        orderId: mockOrderId,
        paymentIntentId: mockPaymentIntent.id,
        amount: mockPaymentIntent.amount,
        currency: mockPaymentIntent.currency,
        status: mockPaymentIntent.status,
        paymentMethod: mockPaymentIntent.payment_method,
        captureMethod: undefined,
        confirmationMethod: undefined,
        receiptEmail: null,
        createdAt: expect.any(Date),
      });
      expect(result.status).toBe(201);
      expect(result.success).toBe(true);
    });
  });
});
