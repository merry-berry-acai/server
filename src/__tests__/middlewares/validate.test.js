const { validateRequiredFields } = require('../../middlewares/validate');
const { ApiError } = require('../../utils/errorHandler');

// Mock the errorHandler module
jest.mock('../../utils/errorHandler', () => {
  // Create a mock constructor that we can use for instanceof checks
  const MockApiError = jest.fn().mockImplementation((statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  });
  
  // Make sure instances of MockApiError pass instanceof checks
  MockApiError.prototype = Object.create(Error.prototype);
  
  return {
    ApiError: MockApiError
  };
});

describe('Validation Middleware', () => {
  describe('validateRequiredFields', () => {
    let req, res, next;

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Set up test doubles
      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should call next() when all required fields are present', () => {
      // Arrange
      req.body = {
        name: 'Test Item',
        price: 9.99,
        category: 'test-category'
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(ApiError).not.toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', () => {
      // Arrange
      req.body = {
        name: 'Test Item',
        // price is missing
        category: 'test-category'
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act & Assert
      expect(() => middleware(req, res, next)).toThrow('Missing required fields: price');
      expect(ApiError).toHaveBeenCalledWith(
        400,
        'Missing required fields: price'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle multiple missing fields', () => {
      // Arrange
      req.body = {
        name: 'Test Item'
        // price and category are missing
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act & Assert
      expect(() => middleware(req, res, next)).toThrow('Missing required fields: price, category');
      expect(ApiError).toHaveBeenCalledWith(
        400,
        'Missing required fields: price, category'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle empty body', () => {
      // Arrange
      req.body = {};
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act & Assert
      expect(() => middleware(req, res, next)).toThrow('Missing required fields: name, price, category');
      expect(ApiError).toHaveBeenCalledWith(
        400,
        'Missing required fields: name, price, category'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle null or undefined values', () => {
      // Arrange
      req.body = {
        name: 'Test Item',
        price: null,
        category: undefined
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act & Assert
      expect(() => middleware(req, res, next)).toThrow('Missing required fields: price, category');
      expect(ApiError).toHaveBeenCalledWith(
        400,
        'Missing required fields: price, category'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle empty string values', () => {
      // Arrange
      req.body = {
        name: 'Test Item',
        price: 9.99,
        category: ''  // Empty string
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act & Assert
      expect(() => middleware(req, res, next)).toThrow('Missing required fields: category');
      expect(ApiError).toHaveBeenCalledWith(
        400,
        'Missing required fields: category'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept zero as a valid value', () => {
      // Arrange
      req.body = {
        name: 'Test Item',
        price: 0,  // Zero is a valid value
        category: 'test-category'
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category']);

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(ApiError).not.toHaveBeenCalled();
    });

    it('should accept false as a valid value', () => {
      // Arrange
      req.body = {
        name: 'Test Item',
        price: 9.99,
        category: 'test-category',
        isActive: false  // False is a valid value
      };
      
      const middleware = validateRequiredFields(['name', 'price', 'category', 'isActive']);

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(ApiError).not.toHaveBeenCalled();
    });
  });
});
