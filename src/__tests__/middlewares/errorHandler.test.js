const { errorHandler, AppError, notFoundHandler } = require('../../middlewares/errorHandler');
const Logger = require('../../utils/logger');
const { sendError } = require('../../utils/responseHandler');

// Mock dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/responseHandler', () => ({
  sendError: jest.fn()
}));

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      id: 'test-request-id',
      originalUrl: '/api/test',
      method: 'GET',
      userId: 'user-123',
      firebaseUid: 'firebase-uid-123'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    // Mock process.env
    process.env.NODE_ENV = 'test';
  });

  describe('errorHandler', () => {
    it('should log server errors (500+) with error level', () => {
      // Arrange
      const err = new Error('Internal server error');
      err.statusCode = 500;
      err.errorCode = 'SERVER_ERROR';
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(Logger.error).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Internal server error',
        500,
        expect.any(Object), // Stack trace in non-production
        'SERVER_ERROR'
      );
    });

    it('should log client errors (400-499) with warn level', () => {
      // Arrange
      const err = new Error('Bad request');
      err.statusCode = 400;
      err.errorCode = 'BAD_REQUEST';
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(Logger.warn).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Bad request',
        400,
        expect.any(Object), // Stack trace in non-production
        'BAD_REQUEST'
      );
    });

    it('should use default values when not provided', () => {
      // Arrange
      const err = new Error();
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(sendError).toHaveBeenCalledWith(
        res,
        'An unexpected error occurred',
        500,
        expect.any(Object), // Stack trace in non-production
        'SERVER_ERROR'
      );
    });

    it('should format Mongoose validation errors', () => {
      // Arrange
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        name: {
          path: 'name',
          message: 'Name is required',
          value: ''
        },
        email: {
          path: 'email',
          message: 'Invalid email format',
          value: 'not-an-email'
        }
      };
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Validation failed',
        500,
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: 'Name is required'
          }),
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email format'
          })
        ]),
        'SERVER_ERROR'
      );
    });

    it('should format MongoDB duplicate key errors', () => {
      // Arrange
      const err = new Error('Duplicate key error');
      err.name = 'MongoError';
      err.code = 11000;
      err.keyValue = { email: 'duplicate@example.com' };
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Duplicate key error',
        500,
        expect.objectContaining({
          type: 'DuplicateKey',
          field: 'email',
          value: 'duplicate@example.com'
        }),
        'SERVER_ERROR'
      );
    });

    it('should include stack trace in non-production environment', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const err = new Error('Test error');
      err.stack = 'Error: Test error\n    at Test.js:10:15';
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Test error',
        500,
        expect.objectContaining({
          stack: err.stack
        }),
        'SERVER_ERROR'
      );
    });

    it('should not include stack trace in production environment', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const err = new Error('Test error');
      err.stack = 'Error: Test error\n    at Test.js:10:15';
      
      // Act
      errorHandler(err, req, res, next);
      
      // Assert
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Test error',
        500,
        null,
        'SERVER_ERROR'
      );
    });
  });

  describe('AppError', () => {
    it('should create an error with status code and error code', () => {
      // Act
      const error = new AppError('Custom error message', 403, 'FORBIDDEN');
      
      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Custom error message');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.name).toBe('AppError');
    });

    it('should create an error with default error code when not provided', () => {
      // Act
      const error = new AppError('Custom error message', 403);
      
      // Assert
      expect(error.errorCode).toBeNull();
    });
  });

  describe('notFoundHandler', () => {
    it('should log warning and return 404 error', () => {
      // Arrange
      req.originalUrl = '/api/nonexistent';
      req.get = jest.fn().mockReturnValue('Mozilla/5.0');
      
      // Act
      notFoundHandler(req, res, next);
      
      // Assert
      expect(Logger.warn).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Route not found: /api/nonexistent',
        404,
        null,
        'ROUTE_NOT_FOUND'
      );
    });
  });
});
