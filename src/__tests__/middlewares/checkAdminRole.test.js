const { checkAdminRole } = require('../../middlewares/checkAdminRole');
const { User } = require('../../models/UserModel');

// Mock the User model
jest.mock('../../models/UserModel', () => ({
  User: {
    findOne: jest.fn()
  }
}));

describe('checkAdminRole Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      params: {},
      user: null,
      userRole: null,
      firebaseUid: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    // Spy on console.log and console.error
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore console mocks
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('When user role is already attached', () => {
    it('should call next() when user is admin', () => {
      // Arrange
      req.userRole = 'admin';
      req.user = { email: 'admin@example.com' };
      
      // Act
      checkAdminRole(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when user is accessing their own data by _id', () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      req.userRole = 'user';
      req.user = { 
        _id: userId,
        email: 'user@example.com' 
      };
      req.params.id = userId;
      
      // Act
      checkAdminRole(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when user is accessing their own data by uid', () => {
      // Arrange
      const uid = 'firebase-uid-123';
      req.userRole = 'user';
      req.user = { 
        uid: uid,
        email: 'user@example.com' 
      };
      req.params.id = uid;
      
      // Act
      checkAdminRole(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not admin and not accessing their own data', () => {
      // Arrange
      req.userRole = 'user';
      req.user = { 
        _id: '60d21b4667d0d8992e610c85',
        email: 'user@example.com' 
      };
      req.params.id = 'different-id';
      
      // Act
      checkAdminRole(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Forbidden: Insufficient permissions'
      }));
    });
  });

  describe('When user role is not attached', () => {
    it('should return 401 when firebaseUid is not provided', async () => {
      // Arrange
      req.firebaseUid = null;
      
      // Act
      await checkAdminRole(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Unauthorized: Authentication required'
      }));
    });

    it('should return 404 when user is not found in database', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      User.findOne.mockResolvedValue(null);
      
      // Act
      await checkAdminRole(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'User not found'
      }));
    });

    it('should call next() when user is found and is admin', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      const mockUser = { 
        _id: '60d21b4667d0d8992e610c85',
        uid: 'firebase-uid-123',
        email: 'admin@example.com',
        role: 'admin'
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await checkAdminRole(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(req.user).toEqual(mockUser);
      expect(req.userRole).toBe('admin');
      expect(req.userId).toBe(mockUser._id);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when user is found and accessing their own data', async () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      req.firebaseUid = 'firebase-uid-123';
      req.params.id = userId;
      const mockUser = { 
        _id: userId,
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await checkAdminRole(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(req.user).toEqual(mockUser);
      expect(req.userRole).toBe('user');
      expect(req.userId).toBe(mockUser._id);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 when user is found but not admin and not accessing their own data', async () => {
      // Arrange
      req.firebaseUid = 'firebase-uid-123';
      req.params.id = 'different-id';
      const mockUser = { 
        _id: '60d21b4667d0d8992e610c85',
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        role: 'user'
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await checkAdminRole(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(req.user).toEqual(mockUser);
      expect(req.userRole).toBe('user');
      expect(req.userId).toBe(mockUser._id);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Forbidden: Insufficient permissions'
      }));
    });
  });

  it('should handle errors and return 500', async () => {
    // Arrange
    req.firebaseUid = 'firebase-uid-123';
    const error = new Error('Database error');
    User.findOne.mockRejectedValue(error);
    
    // Act
    await checkAdminRole(req, res, next);
    
    // Assert
    expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Internal server error'
    }));
    expect(console.error).toHaveBeenCalled();
  });
});
