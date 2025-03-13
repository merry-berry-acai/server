const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../../controllers/orderController');

// Mock the Order model
jest.mock('../../models/OrderModel', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
    _id: 'mock-order-id',
    user: 'mock-user-id',
    items: [{ product: 'mock-product-id', quantity: 1 }],
    totalPrice: 10.99,
    specialInstructions: '',
    status: 'pending',
    toObject: () => ({
      _id: 'mock-order-id',
      user: 'mock-user-id',
      items: [{ product: 'mock-product-id', quantity: 1 }],
      totalPrice: 10.99,
      specialInstructions: '',
      status: 'pending'
    })
  }));
});

// Mock the User model
jest.mock('../../models/UserModel', () => {
  return {
    User: {
      findByIdAndUpdate: jest.fn().mockResolvedValue({
        _id: 'mock-user-id',
        displayName: 'Mock User',
        email: 'mock@example.com',
        orderHistory: ['mock-order-id']
      })
    }
  };
});

// Get the mocked models
const Order = require('../../models/OrderModel');
const { User } = require('../../models/UserModel');

describe('Order Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order with valid data', async () => {
      // Arrange
      const mockOrder = {
        _id: 'mock-order-id',
        user: 'user-id',
        items: [{ product: 'product-id', quantity: 1 }],
        totalPrice: 15.99,
        specialInstructions: 'Test instructions',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Order.mockImplementation(() => mockOrder);

      // Act
      const result = await createOrder(
        'user-id',
        [{ product: 'product-id', quantity: 1 }],
        15.99,
        'Test instructions'
      );

      // Assert
      expect(Order).toHaveBeenCalledWith({
        user: 'user-id',
        items: [{ product: 'product-id', quantity: 1 }],
        totalPrice: 15.99,
        specialInstructions: 'Test instructions'
      });
      expect(mockOrder.save).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id',
        { $push: { orderHistory: mockOrder._id } },
        { new: true }
      );
      expect(result.error).toBe(false);
      expect(result.order).toEqual(mockOrder);
    });

    it('should handle missing user ID', async () => {
      // Act
      const result = await createOrder(
        null,
        [{ product: 'product-id', quantity: 1 }],
        15.99
      );

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
      expect(result.message).toBe('User ID is required to create an order');
    });

    it('should handle missing items', async () => {
      // Act
      const result = await createOrder('user-id', null, 15.99);

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Order must contain at least one item');
    });

    it('should handle empty items array', async () => {
      // Act
      const result = await createOrder('user-id', [], 15.99);

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Order must contain at least one item');
    });

    it('should handle missing total price', async () => {
      // Act
      const result = await createOrder(
        'user-id',
        [{ product: 'product-id', quantity: 1 }],
        null
      );

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Total price is required');
    });

    it('should handle invalid total price', async () => {
      // Act
      const result = await createOrder(
        'user-id',
        [{ product: 'product-id', quantity: 1 }],
        -5
      );

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Total price must be a positive number');
    });

    it('should handle total price as an object', async () => {
      // Arrange
      const mockOrder = {
        _id: 'mock-order-id',
        user: 'user-id',
        items: [{ product: 'product-id', quantity: 1 }],
        totalPrice: 25.99,
        specialInstructions: '',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Order.mockImplementation(() => mockOrder);

      // Act
      const result = await createOrder(
        'user-id',
        [{ product: 'product-id', quantity: 1 }],
        { totalPrice: 25.99 }
      );

      // Assert
      expect(Order).toHaveBeenCalledWith({
        user: 'user-id',
        items: [{ product: 'product-id', quantity: 1 }],
        totalPrice: 25.99,
        specialInstructions: ''
      });
      expect(result.error).toBe(false);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const validationError = new Error('Validation error');
      validationError.name = 'ValidationError';
      validationError.errors = {
        totalPrice: { message: 'Total price is required' },
        items: { message: 'Items are required' }
      };

      const mockOrder = {
        save: jest.fn().mockRejectedValue(validationError)
      };
      
      Order.mockImplementation(() => mockOrder);

      // Act
      const result = await createOrder(
        'user-id',
        [{ product: 'product-id', quantity: 1 }],
        15.99
      );

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Order validation failed');
      expect(result.details).toEqual({
        totalPrice: 'Total price is required',
        items: 'Items are required'
      });
    });

    it('should handle other errors', async () => {
      // Arrange
      const mockError = new Error('Database error');
      
      const mockOrder = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      
      Order.mockImplementation(() => mockOrder);

      // Act
      const result = await createOrder(
        'user-id',
        [{ product: 'product-id', quantity: 1 }],
        15.99
      );

      // Assert
      expect(result.error).toBe(true);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Failed to create order: Database error');
    });
  });

  describe('getOrderById', () => {
    it('should return an order when valid ID is provided', async () => {
      // Arrange
      const mockOrder = {
        _id: 'valid-id',
        user: 'user-id',
        items: [{ product: 'product-id', quantity: 1 }],
        totalPrice: 15.99
      };
      
      Order.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockOrder)
          })
        })
      });

      // Act
      const result = await getOrderById('valid-id');

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error when order is not found', async () => {
      // Arrange
      Order.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      });

      // Act & Assert
      await expect(getOrderById('non-existent-id')).rejects.toThrow('Order not found');
    });

    it('should throw an error when findById fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Order.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(mockError)
          })
        })
      });

      // Act & Assert
      await expect(getOrderById('valid-id')).rejects.toThrow('Failed to fetch order');
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      // Arrange
      const mockOrders = [
        { _id: 'id1', user: 'user1', totalPrice: 15.99 },
        { _id: 'id2', user: 'user2', totalPrice: 25.99 }
      ];
      
      Order.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockOrders)
          })
        })
      });

      // Act
      const result = await getAllOrders();

      // Assert
      expect(Order.find).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });

    it('should throw an error when find fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Order.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(mockError)
          })
        })
      });

      // Act & Assert
      await expect(getAllOrders()).rejects.toThrow('Failed to fetch orders');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update an order status with valid data', async () => {
      // Arrange
      const mockUpdatedOrder = {
        _id: 'valid-id',
        user: 'user-id',
        items: [{ product: 'product-id', quantity: 1 }],
        totalPrice: 15.99,
        orderStatus: 'completed'
      };
      
      Order.findOneAndUpdate = jest.fn().mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await updateOrderStatus('valid-id', 'completed');

      // Assert
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'valid-id' },
        { orderStatus: 'completed' },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should throw an error when order is not found', async () => {
      // Arrange
      Order.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(updateOrderStatus('non-existent-id', 'completed')).rejects.toThrow('Order not found.');
    });

    it('should throw an error when findOneAndUpdate fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Order.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateOrderStatus('valid-id', 'completed')).rejects.toThrow('Database error');
    });
  });
});
