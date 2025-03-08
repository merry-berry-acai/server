const {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByUid,
  updateUserByUid,
  deleteUserByUid,
  getUserOrders
} = require('../../controllers/userController');
const { ApiError } = require('../../utils/errorHandler');

// Mock the User model
jest.mock('../../models/UserModel', () => {
  const mockSave = jest.fn();
  const mockUser = {
    save: mockSave,
    _id: 'mock-id',
    uid: 'firebase-uid-123',
    displayName: 'Mock User',
    email: 'mock@example.com',
    photoURL: '',
    favorites: [],
    orderHistory: [],
    role: 'user',
    toObject: () => ({
      _id: 'mock-id',
      uid: 'firebase-uid-123',
      displayName: 'Mock User',
      email: 'mock@example.com',
      photoURL: '',
      favorites: [],
      orderHistory: [],
      role: 'user'
    })
  };

  return {
    User: {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      mockImplementation: () => mockUser
    }
  };
});

// Get the mocked model
const { User } = require('../../models/UserModel');

describe('User Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const mockUser = {
        _id: 'mock-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
        favorites: [],
        role: 'user',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.mockImplementation = () => mockUser;

      const userData = {
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg'
      };

      // Act
      const result = await createUser(userData);

      // Assert
      expect(User).toHaveBeenCalledWith({
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
        favorites: [],
        role: 'user'
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should create a user with admin role when specified', async () => {
      // Arrange
      const mockUser = {
        _id: 'mock-id',
        uid: 'firebase-uid-123',
        displayName: 'Admin User',
        email: 'admin@example.com',
        photoURL: '',
        favorites: [],
        role: 'admin',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.mockImplementation = () => mockUser;

      const userData = {
        uid: 'firebase-uid-123',
        displayName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };

      // Act
      const result = await createUser(userData);

      // Assert
      expect(User).toHaveBeenCalledWith({
        uid: 'firebase-uid-123',
        displayName: 'Admin User',
        email: 'admin@example.com',
        photoURL: '',
        favorites: [],
        role: 'admin'
      });
      expect(result.role).toBe('admin');
    });

    it('should throw an error for invalid role', async () => {
      // Arrange
      const userData = {
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        role: 'superadmin' // Invalid role
      };

      // Act & Assert
      await expect(createUser(userData)).rejects.toThrow("Role must be either 'user' or 'admin'");
    });

    it('should throw an error when duplicate user is detected', async () => {
      // Arrange
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      duplicateError.keyValue = { email: 'existing@example.com' };

      const mockUser = {
        save: jest.fn().mockRejectedValue(duplicateError)
      };
      
      User.mockImplementation = () => mockUser;

      const userData = {
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'existing@example.com'
      };

      // Act & Assert
      await expect(createUser(userData)).rejects.toThrow('Duplicate value detected: email already exists');
    });

    it('should throw an error when save fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      
      const mockUser = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      
      User.mockImplementation = () => mockUser;

      const userData = {
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com'
      };

      // Act & Assert
      await expect(createUser(userData)).rejects.toThrow('Failed to create user');
    });
  });

  describe('getUserById', () => {
    it('should return a user when valid MongoDB ObjectId is provided', async () => {
      // Arrange
      const mockUser = {
        _id: 'valid-mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com'
      };
      
      User.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserById('valid-mongo-id');

      // Assert
      expect(User.findById).toHaveBeenCalledWith('valid-mongo-id');
      expect(result).toEqual(mockUser);
    });

    it('should find user by Firebase UID when ObjectId lookup fails', async () => {
      // Arrange
      const mockUser = {
        _id: 'mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com'
      };
      
      User.findById.mockResolvedValue(null);
      User.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await getUserById('firebase-uid-123');

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findById.mockResolvedValue(null);
      User.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserById('non-existent-id')).rejects.toThrow("User with ID/UID 'non-existent-id' not found");
    });

    it('should throw an error when findById fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.findById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getUserById('valid-id')).rejects.toThrow('Database error');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with populated order history', async () => {
      // Arrange
      const mockUsers = [
        { _id: 'id1', displayName: 'User 1', email: 'user1@example.com' },
        { _id: 'id2', displayName: 'User 2', email: 'user2@example.com' }
      ];
      
      User.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUsers)
      });

      // Act
      const result = await getAllUsers();

      // Assert
      expect(User.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error when find fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError)
      });

      // Act & Assert
      await expect(getAllUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('updateUser', () => {
    it('should update a user with valid data', async () => {
      // Arrange
      const mockUpdatedUser = {
        _id: 'valid-id',
        displayName: 'Updated User',
        email: 'updated@example.com'
      };
      
      User.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      // Act
      const result = await updateUser('valid-id', {
        displayName: 'Updated User',
        email: 'updated@example.com'
      });

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'valid-id',
        {
          displayName: 'Updated User',
          email: 'updated@example.com'
        },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(updateUser('non-existent-id', { displayName: 'Updated User' }))
        .rejects
        .toThrow('User not found or update failed');
    });

    it('should throw an error when findByIdAndUpdate fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError)
      });

      // Act & Assert
      await expect(updateUser('valid-id', { displayName: 'Updated User' }))
        .rejects
        .toThrow('Failed to update user');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user when valid ID is provided', async () => {
      // Arrange
      const mockDeletedUser = {
        _id: 'valid-id',
        displayName: 'User to Delete',
        email: 'delete@example.com'
      };
      
      User.findByIdAndDelete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUser('valid-id');

      // Assert
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockDeletedUser);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteUser('non-existent-id'))
        .rejects
        .toThrow('User not found or already deleted');
    });

    it('should throw an error when findByIdAndDelete fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.findByIdAndDelete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteUser('valid-id'))
        .rejects
        .toThrow('Failed to delete user');
    });
  });

  describe('getUserByUid', () => {
    it('should return a user when valid Firebase UID is provided', async () => {
      // Arrange
      const mockUser = {
        _id: 'mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        orderHistory: []
      };
      
      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      const result = await getUserByUid('firebase-uid-123');

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(getUserByUid('non-existent-uid'))
        .rejects
        .toThrow('User with uid non-existent-uid not found');
    });

    it('should throw an error when findOne fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.findOne.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError)
      });

      // Act & Assert
      await expect(getUserByUid('firebase-uid-123'))
        .rejects
        .toThrow('Failed to fetch user');
    });
  });

  describe('updateUserByUid', () => {
    it('should update a user with valid data', async () => {
      // Arrange
      const mockUpdatedUser = {
        _id: 'mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Updated User',
        email: 'updated@example.com'
      };
      
      User.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      // Act
      const result = await updateUserByUid('firebase-uid-123', {
        displayName: 'Updated User',
        email: 'updated@example.com'
      });

      // Assert
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { uid: 'firebase-uid-123' },
        {
          displayName: 'Updated User',
          email: 'updated@example.com'
        },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(updateUserByUid('non-existent-uid', { displayName: 'Updated User' }))
        .rejects
        .toThrow('User not found or update failed');
    });

    it('should throw an error when findOneAndUpdate fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError)
      });

      // Act & Assert
      await expect(updateUserByUid('firebase-uid-123', { displayName: 'Updated User' }))
        .rejects
        .toThrow('Failed to update user');
    });
  });

  describe('deleteUserByUid', () => {
    it('should delete a user when valid Firebase UID is provided', async () => {
      // Arrange
      const mockDeletedUser = {
        _id: 'mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'User to Delete',
        email: 'delete@example.com'
      };
      
      User.findOneAndDelete.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await deleteUserByUid('firebase-uid-123');

      // Assert
      expect(User.findOneAndDelete).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(result).toEqual(mockDeletedUser);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findOneAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteUserByUid('non-existent-uid'))
        .rejects
        .toThrow('User not found or already deleted');
    });

    it('should throw an error when findOneAndDelete fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      User.findOneAndDelete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteUserByUid('firebase-uid-123'))
        .rejects
        .toThrow('Failed to delete user');
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders when valid MongoDB ObjectId is provided', async () => {
      // Arrange
      const mockUser = {
        _id: 'valid-mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        orderHistory: [
          {
            _id: 'order-1',
            items: [{ product: { name: 'Product 1' }, quantity: 1 }],
            totalPrice: 15.99,
            createdAt: new Date(),
            toObject: () => ({
              _id: 'order-1',
              items: [{ product: { name: 'Product 1' }, quantity: 1 }],
              totalPrice: 15.99,
              createdAt: new Date()
            })
          }
        ]
      };
      
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      const result = await getUserOrders('valid-mongo-id');

      // Assert
      expect(User.findById).toHaveBeenCalledWith('valid-mongo-id');
      expect(result.length).toBe(1);
      expect(result[0].formattedDate).toBeDefined();
    });

    it('should find user orders by Firebase UID when ObjectId lookup fails', async () => {
      // Arrange
      const mockUser = {
        _id: 'mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        orderHistory: [
          {
            _id: 'order-1',
            items: [{ product: { name: 'Product 1' }, quantity: 1 }],
            totalPrice: 15.99,
            createdAt: new Date(),
            toObject: () => ({
              _id: 'order-1',
              items: [{ product: { name: 'Product 1' }, quantity: 1 }],
              totalPrice: 15.99,
              createdAt: new Date()
            })
          }
        ]
      };
      
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      
      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      const result = await getUserOrders('firebase-uid-123');

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'firebase-uid-123' });
      expect(result.length).toBe(1);
    });

    it('should return empty array when user has no order history', async () => {
      // Arrange
      const mockUser = {
        _id: 'valid-mongo-id',
        uid: 'firebase-uid-123',
        displayName: 'Test User',
        email: 'test@example.com',
        orderHistory: []
      };
      
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      const result = await getUserOrders('valid-mongo-id');

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      
      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(getUserOrders('non-existent-id'))
        .rejects
        .toThrow("User with ID/UID 'non-existent-id' not found");
    });

    it('should handle items with missing product data', async () => {
      // Arrange
      const mockUser = {
        _id: 'valid-mongo-id',
        orderHistory: [
          {
            _id: 'order-1',
            items: [
              { product: null, quantity: 1, toppings: [] }
            ],
            totalPrice: 15.99,
            createdAt: new Date(),
            toObject: () => ({
              _id: 'order-1',
              items: [
                { product: null, quantity: 1, toppings: [] }
              ],
              totalPrice: 15.99,
              createdAt: new Date()
            })
          }
        ]
      };
      
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      const result = await getUserOrders('valid-mongo-id');

      // Assert
      expect(result[0].items[0].product.name).toBe('Product no longer available');
      expect(result[0].items[0].itemTotal).toBe(0);
    });
  });
});
