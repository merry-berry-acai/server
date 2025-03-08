const jwt = require('jsonwebtoken');
const { checkUserFirebaseUid, checkUserId } = require('../../middlewares/checkUser');
const { User } = require('../../models/UserModel');
const Logger = require('../../utils/logger');
const { sendError } = require('../../utils/responseHandler');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/UserModel', () => ({
  User: {
    findOne: jest.fn()
  }
}));
jest.mock('../../utils/logger');
jest.mock('../../utils/responseHandler', () => ({
  sendError: jest.fn()
}));

describe('User Authentication Middlewares', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      headers: {},
      originalUrl: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      id: 'test-request-id'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('checkUserFirebaseUid Middleware', () => {
    it('should proceed as guest when no authorization header is provided', async () => {
      // Arrange
      req.headers.authorization = undefined;
      
      // Act
      await checkUserFirebaseUid(req, res, next);
      
      // Assert
      expect(Logger.warn).toHaveBeenCalled();
      expect(req.firebaseUid).toBeNull();
      expect(req.authStatus).toBe('guest');
      expect(next).toHaveBeenCalled();
      expect(sendError).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      jwt.decode.mockReturnValue(null);
      
      // Act
      await checkUserFirebaseUid(req, res, next);
      
      // Assert
      expect(jwt.decode).toHaveBeenCalledWith('invalid-token');
      expect(Logger.error).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Invalid authentication token format',
        401,
        null,
        'AUTH_INVALID_TOKEN_FORMAT'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing user_id field', async () => {
      // Arrange
      req.headers.authorization = 'Bearer incomplete-token';
      jwt.decode.mockReturnValue({ email: 'test@example.com' }); // No user_id
      
      // Act
      await checkUserFirebaseUid(req, res, next);
      
      // Assert
      expect(jwt.decode).toHaveBeenCalledWith('incomplete-token');
      expect(Logger.error).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Invalid token: missing user identifier',
        401,
        null,
        'AUTH_MISSING_USER_ID'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      // Arrange
      req.headers.authorization = 'Bearer expired-token';
      const now = Math.floor(Date.now() / 1000);
      jwt.decode.mockReturnValue({ 
        user_id: 'firebase-uid-123',
        exp: now - 3600 // Expired 1 hour ago
      });
      
      // Act
      await checkUserFirebaseUid(req, res, next);
      
      // Assert
      expect(jwt.decode).toHaveBeenCalledWith('expired-token');
      expect(Logger.warn).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Authentication token has expired',
        401,
        null,
        'AUTH_TOKEN_EXPIRED'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract Firebase UID and proceed when token is valid', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';
      const now = Math.floor(Date.now() / 1000);
      jwt.decode.mockReturnValue({ 
        user_id: 'firebase-uid-123',
        email: 'user@example.com',
        exp: now + 3600 // Valid for 1 more hour
      });
      
      // Act
      await checkUserFirebaseUid(req, res, next);
      
      // Assert
      expect(jwt.decode).toHaveBeenCalledWith('valid-token');
      expect(Logger.info).toHaveBeenCalled();
      expect(req.firebaseUid).toBe('firebase-uid-123');
      expect(req.authStatus).toBe('authenticated');
      expect(req.decodedToken).toEqual(expect.objectContaining({
        user_id: 'firebase-uid-123',
        email: 'user@example.com'
      }));
      expect(next).toHaveBeenCalled();
      expect(sendError).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';
      const error = new Error('JWT processing error');
      jwt.decode.mockImplementation(() => {
        throw error;
      });
      
      // Act
      await checkUserFirebaseUid(req, res, next);
      
      // Assert
      expect(Logger.error).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Failed to process authentication token',
        500,
        { message: error.message },
        'AUTH_PROCESSING_ERROR'
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkUserId Middleware', () => {
    it('should proceed as guest when no Firebase UID is provided', async () => {
      // Arrange
      req.firebaseUid = null;
      
      // Act
      await checkUserId(req, res, next);
      
      // Assert
      expect(Logger.info).toHaveBeenCalled();
      expect(req.userId).toBeNull();
      expect(req.userRole).toBe('guest');
      expect(next).toHaveBeenCalled();
      expect(User.findOne).not.toHaveBeenCalled();
      expect(sendError).not.toHaveBeenCalled();
    });

    it('should attach user data when user is found in database', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      const mockUser = { 
        _id: '60d21b4667d0d8992e610c85',
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await checkUserId(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(Logger.info).toHaveBeenCalled();
      expect(req.userId).toBe(mockUser._id);
      expect(req.userRole).toBe('user');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(sendError).not.toHaveBeenCalled();
    });

    it('should proceed as guest with unregistered status when user is not found in database', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      User.findOne.mockResolvedValue(null);
      
      // Act
      await checkUserId(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(Logger.warn).toHaveBeenCalled();
      expect(req.userId).toBeNull();
      expect(req.userRole).toBe('guest');
      expect(req.authStatus).toBe('unregistered');
      expect(next).toHaveBeenCalled();
      expect(sendError).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      const error = new Error('Database error');
      User.findOne.mockRejectedValue(error);
      
      // Act
      await checkUserId(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(Logger.error).toHaveBeenCalled();
      expect(sendError).toHaveBeenCalledWith(
        res,
        'Failed to verify user account',
        500,
        { message: error.message },
        'USER_VERIFICATION_ERROR'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should use default role "user" when role is not specified', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      const mockUser = { 
        _id: '60d21b4667d0d8992e610c85',
        uid: 'firebase-uid-123',
        email: 'user@example.com'
        // No role specified
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await checkUserId(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(req.userRole).toBe('user'); // Default role
      expect(next).toHaveBeenCalled();
    });
  });
});
