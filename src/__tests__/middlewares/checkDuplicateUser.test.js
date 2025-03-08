const { checkDuplicateUser } = require('../../middlewares/checkDuplicateUser');
const { User } = require('../../models/UserModel');

// Mock the User model
jest.mock('../../models/UserModel', () => ({
  User: {
    findOne: jest.fn()
  }
}));

describe('checkDuplicateUser Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      body: {},
      params: {},
      method: 'POST',
      firebaseUid: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore console mock
    console.error.mockRestore();
  });

  describe('For POST requests (new user creation)', () => {
    beforeEach(() => {
      req.method = 'POST';
    });

    it('should call next() when no email is provided', async () => {
      // Arrange
      req.body = { name: 'Test User' }; // No email
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when email is provided and no user exists with that email', async () => {
      // Arrange
      req.body = { email: 'new@example.com' };
      User.findOne.mockResolvedValue(null);
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 409 when email is already in use', async () => {
      // Arrange
      req.body = { email: 'existing@example.com' };
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'User with this email already exists'
      }));
    });
  });

  describe('For PUT/PATCH requests (user updates)', () => {
    beforeEach(() => {
      req.method = 'PUT';
    });

    it('should call next() when no email is provided', async () => {
      // Arrange
      req.body = { name: 'Updated Name' }; // No email
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 when user ID cannot be determined', async () => {
      // Arrange
      req.body = { email: 'update@example.com' };
      // No params.id and no firebaseUid
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'User identification required for update'
      }));
    });

    it('should call next() when email is provided and no user exists with that email', async () => {
      // Arrange
      req.body = { email: 'update@example.com' };
      req.params.id = '60d21b4667d0d8992e610c85';
      User.findOne.mockResolvedValue(null);
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'update@example.com' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when email belongs to the same user being updated (using params.id)', async () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      req.body = { email: 'update@example.com' };
      req.params.id = userId;
      User.findOne.mockResolvedValue({ 
        _id: userId,
        email: 'update@example.com'
      });
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'update@example.com' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when email belongs to the same user being updated (using firebaseUid)', async () => {
      // Arrange
      const userId = '60d21b4667d0d8992e610c85';
      const firebaseUid = 'firebase-uid-123';
      req.body = { email: 'update@example.com' };
      req.firebaseUid = firebaseUid;
      
      // First findOne call to get current user
      User.findOne.mockResolvedValueOnce({ 
        _id: userId,
        uid: firebaseUid
      });
      
      // Second findOne call to check email
      User.findOne.mockResolvedValueOnce({ 
        _id: userId,
        email: 'update@example.com'
      });
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledTimes(2);
      expect(User.findOne).toHaveBeenNthCalledWith(1, { uid: firebaseUid });
      expect(User.findOne).toHaveBeenNthCalledWith(2, { email: 'update@example.com' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 409 when email belongs to a different user', async () => {
      // Arrange
      req.body = { email: 'existing@example.com' };
      req.params.id = '60d21b4667d0d8992e610c85';
      User.findOne.mockResolvedValue({ 
        _id: 'different-user-id',
        email: 'existing@example.com'
      });
      
      // Act
      await checkDuplicateUser(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Email already in use by another user'
      }));
    });
  });

  it('should handle errors and return 500', async () => {
    // Arrange
    req.body = { email: 'test@example.com' };
    const error = new Error('Database error');
    User.findOne.mockRejectedValue(error);
    
    // Act
    await checkDuplicateUser(req, res, next);
    
    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Internal server error while checking user data'
    }));
    expect(console.error).toHaveBeenCalled();
  });
});
