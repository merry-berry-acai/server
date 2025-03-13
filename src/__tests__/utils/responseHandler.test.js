const { sendSuccess, sendError, sendValidationError } = require('../../utils/responseHandler');
const Logger = require('../../utils/logger');

// Mock the Logger
jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('Response Handler Utilities', () => {
  let mockRes;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });
  
  describe('sendSuccess', () => {
    it('should send a success response with default values', () => {
      // Act
      sendSuccess(mockRes);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Operation successful',
        data: null,
        timestamp: expect.any(String)
      });
      expect(Logger.debug).toHaveBeenCalled();
    });
    
    it('should send a success response with custom values', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };
      const message = 'Custom success message';
      const statusCode = 201;
      
      // Act
      sendSuccess(mockRes, data, message, statusCode);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Custom success message',
        data: { id: 1, name: 'Test' },
        timestamp: expect.any(String)
      });
      expect(Logger.debug).toHaveBeenCalledWith(
        'Sending success response [201]: Custom success message',
        expect.objectContaining({
          statusCode: 201,
          hasData: true
        })
      );
    });
    
    it('should handle null data correctly', () => {
      // Act
      sendSuccess(mockRes, null, 'No data available');
      
      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null
        })
      );
      expect(Logger.debug).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          hasData: false
        })
      );
    });
  });
  
  describe('sendError', () => {
    it('should send an error response with default values', () => {
      // Act
      sendError(mockRes);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'An error occurred',
        timestamp: expect.any(String)
      });
      expect(Logger.error).toHaveBeenCalled();
    });
    
    it('should send an error response with custom values', () => {
      // Arrange
      const message = 'Custom error message';
      const statusCode = 400;
      const errors = { field: 'Invalid value' };
      const errorCode = 'INVALID_INPUT';
      
      // Act
      sendError(mockRes, message, statusCode, errors, errorCode);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Custom error message',
        timestamp: expect.any(String),
        errorCode: 'INVALID_INPUT',
        errors: { field: 'Invalid value' }
      });
      expect(Logger.error).toHaveBeenCalledWith(
        'Sending error response [400]: Custom error message',
        null,
        expect.objectContaining({
          statusCode: 400,
          errorCode: 'INVALID_INPUT',
          hasErrors: true
        })
      );
    });
    
    it('should include stack trace in development mode', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      // Act
      sendError(mockRes, 'Development error', 500, error);
      
      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'Error stack trace'
        })
      );
      
      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should not include stack trace in production mode', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      // Act
      sendError(mockRes, 'Production error', 500, error);
      
      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String)
        })
      );
      
      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe('sendValidationError', () => {
    it('should format array validation errors correctly', () => {
      // Arrange
      const validationErrors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email format' }
      ];
      
      // Act
      sendValidationError(mockRes, validationErrors);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          errors: validationErrors
        })
      );
      expect(Logger.warn).toHaveBeenCalledWith(
        'Validation error: Validation failed',
        expect.objectContaining({
          errorCount: 2
        })
      );
    });
    
    it('should handle non-array validation errors', () => {
      // Arrange
      const validationError = new Error('Invalid input');
      
      // Act
      sendValidationError(mockRes, validationError);
      
      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [{ message: 'Error: Invalid input' }]
        })
      );
      expect(Logger.warn).toHaveBeenCalledWith(
        'Validation error: Validation failed',
        expect.objectContaining({
          errorCount: 1
        })
      );
    });
    
    it('should use the correct status code for validation errors', () => {
      // Act
      sendValidationError(mockRes, ['Test validation error']);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(422);
    });
  });
});
