const { ApiError, errorHandler, asyncHandler } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

// Mock logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn()
}));

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('ApiError', () => {
    it('should create an error with the provided status code and message', () => {
      // Act
      const error = new ApiError(400, 'Bad Request');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Bad Request');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should allow setting isOperational flag', () => {
      // Act
      const error = new ApiError(500, 'Server Error', false);

      // Assert
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Server Error');
      expect(error.isOperational).toBe(false);
    });

    it('should use provided stack when available', () => {
      // Arrange
      const customStack = 'Error: Custom Stack\n    at TestFunction';

      // Act
      const error = new ApiError(400, 'Bad Request', true, customStack);

      // Assert
      expect(error.stack).toBe(customStack);
    });
  });

  describe('errorHandler middleware', () => {
    let req, res, next;

    beforeEach(() => {
      // Set up test doubles
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();

      // Save original environment
      this.originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      // Restore environment
      process.env.NODE_ENV = this.originalEnv;
    });

    it('should respond with error status and message', () => {
      // Arrange
      const error = new ApiError(400, 'Validation Error');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Validation Error'
        })
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should use default status code 500 when not provided', () => {
      // Arrange
      const error = new Error('Generic Error');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Generic Error'
        })
      );
    });

    it('should use default message when not provided', () => {
      // Arrange
      const error = new Error();
      error.message = null;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal Server Error'
        })
      );
    });

    it('should include stack trace in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new Error('Development Error');
      error.stack = 'Error: Development Error\n    at TestFunction';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: error.stack
        })
      );
    });

    it('should not include stack trace in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const error = new Error('Production Error');
      error.stack = 'Error: Production Error\n    at TestFunction';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String)
        })
      );
    });

    it('should log the error with its stack trace', () => {
      // Arrange
      const error = new Error('Test Error');
      error.stack = 'Error: Test Error\n    at TestFunction';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test Error - Stack: Error: Test Error')
      );
    });
  });

  describe('asyncHandler', () => {
    it('should wrap an async function and pass the result', async () => {
      // Arrange
      const req = {};
      const res = { status: 200 };
      const next = jest.fn();
      
      const mockFunction = jest.fn().mockResolvedValue({ success: true });
      const wrappedFunction = asyncHandler(mockFunction);

      // Act
      await wrappedFunction(req, res, next);

      // Assert
      expect(mockFunction).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch errors and pass them to next()', async () => {
      // Arrange
      const req = {};
      const res = {};
      const next = jest.fn();
      const error = new Error('Async Error');
      
      const mockFunction = jest.fn().mockRejectedValue(error);
      const wrappedFunction = asyncHandler(mockFunction);

      // Act
      await wrappedFunction(req, res, next);

      // Assert
      expect(mockFunction).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors in async functions', async () => {
      // Arrange
      const req = {};
      const res = {};
      const next = jest.fn();
      
      const mockFunction = jest.fn().mockImplementation(() => {
        throw new Error('Sync Error in Async Function');
      });
      const wrappedFunction = asyncHandler(mockFunction);

      // Act
      await wrappedFunction(req, res, next);

      // Assert
      expect(mockFunction).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Sync Error in Async Function');
    });

    it('should work with async functions that return values', async () => {
      // Arrange
      const req = { body: { name: 'Test' } };
      const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      // Mock function that uses the request data and returns a response
      const mockFunction = jest.fn().mockImplementation(async (req, res) => {
        const result = await Promise.resolve({ id: 1, name: req.body.name });
        res.status(201).json(result);
        return result;
      });
      
      const wrappedFunction = asyncHandler(mockFunction);

      // Act
      const result = await wrappedFunction(req, res, next);

      // Assert
      expect(mockFunction).toHaveBeenCalledWith(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Test' });
      expect(next).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
  });
});
