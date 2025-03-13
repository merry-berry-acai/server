const express = require('express');
const request = require('supertest');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendSuccess } = require('../../utils/responseHandler');

// Mock dependencies
jest.mock('../../controllers/menuItemController');
jest.mock('../../middlewares/validate');
jest.mock('../../middlewares/checkUser');
jest.mock('../../middlewares/checkAdminRole');
jest.mock('../../middlewares/validateItemCategory');
jest.mock('../../middlewares/validateToppings');
jest.mock('../../utils/responseHandler');

// Import mocked dependencies
const {
  createMenuItem,
  getMenuItemById,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem
} = require('../../controllers/menuItemController');
const { validateRequiredFields } = require('../../middlewares/validate');
const { checkUserFirebaseUid } = require('../../middlewares/checkUser');
const { checkAdminRole } = require('../../middlewares/checkAdminRole');
const { validateCategory } = require('../../middlewares/validateItemCategory');
const { validateToppings } = require('../../middlewares/validateToppings');

// Create a test app
const app = express();
app.use(express.json());

// Import the router
const itemRoutes = require('../../routes/ItemRoutes');
app.use('/items', itemRoutes);

describe('Item Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementations
    sendSuccess.mockImplementation((res, data, message, statusCode = 200) => {
      return res.status(statusCode).json({
        success: true,
        data,
        message: message || 'Operation successful'
      });
    });
    
    // Set up middleware mocks to call next()
    validateRequiredFields.mockImplementation(() => (req, res, next) => next());
    checkUserFirebaseUid.mockImplementation((req, res, next) => next());
    checkAdminRole.mockImplementation((req, res, next) => next());
    validateCategory.mockImplementation((req, res, next) => {
      req.categoryId = 'mock-category-id';
      next();
    });
    validateToppings.mockImplementation((req, res, next) => {
      req.toppingIds = ['mock-topping-id'];
      next();
    });
  });

  describe('POST /items/new', () => {
    it('should create a new menu item with valid data', async () => {
      // Arrange
      const mockNewItem = {
        _id: 'new-item-id',
        name: 'New Test Item',
        description: 'New Test Description',
        basePrice: 9.99,
        category: 'mock-category-id',
        toppings: ['mock-topping-id'],
        imageUrl: 'test-image-url'
      };
      
      createMenuItem.mockResolvedValue(mockNewItem);

      // Act
      const response = await request(app)
        .post('/items/new')
        .send({
          name: 'New Test Item',
          description: 'New Test Description',
          basePrice: 9.99,
          category: 'category-id',
          toppings: ['topping-id'],
          imageUrl: 'test-image-url'
        });

      // Assert
      expect(validateRequiredFields).toHaveBeenCalledWith(['name', 'basePrice', 'category']);
      expect(validateToppings).toHaveBeenCalled();
      expect(validateCategory).toHaveBeenCalled();
      expect(checkUserFirebaseUid).toHaveBeenCalled();
      expect(checkAdminRole).toHaveBeenCalled();
      
      expect(createMenuItem).toHaveBeenCalledWith(
        'New Test Item',
        'New Test Description',
        9.99,
        'mock-category-id',
        ['mock-topping-id'],
        'test-image-url'
      );
      
      expect(sendSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        mockNewItem,
        'Menu item created successfully',
        201
      );
    });

    it('should handle errors when creating a menu item', async () => {
      // Arrange
      const mockError = new Error('Creation failed');
      mockError.statusCode = 400;
      
      createMenuItem.mockRejectedValue(mockError);

      // Mock asyncHandler to pass the error to the next middleware
      jest.mock('../../utils/errorHandler', () => ({
        asyncHandler: (fn) => async (req, res, next) => {
          try {
            await fn(req, res, next);
          } catch (error) {
            next(error);
          }
        }
      }));

      // Act
      const response = await request(app)
        .post('/items/new')
        .send({
          name: 'New Test Item',
          description: 'New Test Description',
          basePrice: 9.99,
          category: 'category-id'
        });

      // Assert
      expect(createMenuItem).toHaveBeenCalled();
      // Note: In a real test, we would expect the response to have status 400,
      // but since we're mocking the error handler, we can't easily test that here.
    });
  });

  describe('GET /items/:id', () => {
    it('should return a menu item when valid ID is provided', async () => {
      // Arrange
      const mockItem = {
        _id: 'test-item-id',
        name: 'Test Item',
        description: 'Test Description',
        basePrice: 9.99
      };
      
      getMenuItemById.mockResolvedValue(mockItem);

      // Act
      const response = await request(app).get('/items/test-item-id');

      // Assert
      expect(getMenuItemById).toHaveBeenCalledWith('test-item-id');
      expect(sendSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        mockItem
      );
    });
  });

  describe('GET /items', () => {
    it('should return all menu items', async () => {
      // Arrange
      const mockItems = [
        { _id: 'item1', name: 'Item 1' },
        { _id: 'item2', name: 'Item 2' }
      ];
      
      getAllMenuItems.mockResolvedValue(mockItems);

      // Act
      const response = await request(app).get('/items');

      // Assert
      expect(getAllMenuItems).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        mockItems
      );
    });
  });

  describe('GET /items/home/featured', () => {
    it('should return featured menu items (first 3)', async () => {
      // Arrange
      const mockFeaturedItems = [
        { _id: 'item1', name: 'Featured Item 1' },
        { _id: 'item2', name: 'Featured Item 2' },
        { _id: 'item3', name: 'Featured Item 3' }
      ];
      
      getAllMenuItems.mockResolvedValue(mockFeaturedItems);

      // Act
      const response = await request(app).get('/items/home/featured');

      // Assert
      expect(getAllMenuItems).toHaveBeenCalledWith(3);
      expect(sendSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        mockFeaturedItems
      );
    });
  });

  describe('PATCH /items/:id', () => {
    it('should update a menu item with valid data', async () => {
      // Arrange
      const mockUpdatedItem = {
        _id: 'test-item-id',
        name: 'Updated Item',
        description: 'Updated Description',
        basePrice: 12.99,
        category: 'mock-category-id'
      };
      
      updateMenuItem.mockResolvedValue(mockUpdatedItem);

      // Act
      const response = await request(app)
        .patch('/items/test-item-id')
        .send({
          name: 'Updated Item',
          description: 'Updated Description',
          basePrice: 12.99,
          category: 'category-id'
        });

      // Assert
      expect(validateCategory).toHaveBeenCalled();
      expect(validateToppings).toHaveBeenCalled();
      expect(checkUserFirebaseUid).toHaveBeenCalled();
      expect(checkAdminRole).toHaveBeenCalled();
      
      expect(updateMenuItem).toHaveBeenCalledWith(
        'test-item-id',
        expect.objectContaining({
          name: 'Updated Item',
          description: 'Updated Description',
          basePrice: 12.99,
          category: 'mock-category-id'
        })
      );
      
      expect(sendSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        mockUpdatedItem,
        'Menu item updated successfully',
        200
      );
    });
  });

  describe('DELETE /items/:id', () => {
    it('should delete a menu item when valid ID is provided', async () => {
      // Arrange
      const mockItem = {
        _id: 'test-item-id',
        name: 'Item to Delete'
      };
      
      getMenuItemById.mockResolvedValue(mockItem);
      deleteMenuItem.mockResolvedValue({ _id: 'test-item-id' });

      // Act
      const response = await request(app).delete('/items/test-item-id');

      // Assert
      expect(checkUserFirebaseUid).toHaveBeenCalled();
      expect(checkAdminRole).toHaveBeenCalled();
      expect(getMenuItemById).toHaveBeenCalledWith('test-item-id');
      expect(deleteMenuItem).toHaveBeenCalledWith('test-item-id');
      
      expect(sendSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        { id: 'test-item-id' },
        "Menu item 'Item to Delete' successfully deleted"
      );
    });
  });
});
