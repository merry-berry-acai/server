const {
  createMenuItem,
  getMenuItemById,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem
} = require('../../controllers/menuItemController');

// Mock the MenuItem model
jest.mock('../../models/MenuItemModel', () => {
  const mockSave = jest.fn();
  const mockItem = {
    save: mockSave,
    _id: 'mock-id',
    name: 'Mock Item',
    description: 'Mock Description',
    basePrice: 10.99,
    category: 'mock-category-id',
    toppings: [],
    imageUrl: 'mock-image-url',
    toObject: () => ({
      _id: 'mock-id',
      name: 'Mock Item',
      description: 'Mock Description',
      basePrice: 10.99,
      category: 'mock-category-id',
      toppings: [],
      imageUrl: 'mock-image-url'
    })
  };

  return {
    Item: jest.fn().mockImplementation(() => mockItem)
  };
});

// Get the mocked model
const { Item } = require('../../models/MenuItemModel');

describe('Menu Item Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createMenuItem', () => {
    it('should create a new menu item with valid data', async () => {
      // Arrange
      const mockItem = {
        _id: 'mock-id',
        name: 'Test Item',
        description: 'Test Description',
        basePrice: 9.99,
        category: 'category-id',
        toppings: [],
        imageUrl: 'test-image-url',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Item.mockImplementation(() => mockItem);

      // Act
      const result = await createMenuItem(
        'Test Item',
        'Test Description',
        9.99,
        'category-id',
        [],
        'test-image-url'
      );

      // Assert
      expect(Item).toHaveBeenCalledWith({
        name: 'Test Item',
        description: 'Test Description',
        basePrice: 9.99,
        category: 'category-id',
        toppings: [],
        imageUrl: 'test-image-url'
      });
      expect(mockItem.save).toHaveBeenCalled();
      expect(result).toEqual(mockItem);
    });

    it('should throw an error when required fields are missing', async () => {
      // Act & Assert
      await expect(createMenuItem(null, 'Description', 9.99, 'category-id'))
        .rejects
        .toThrow('Missing required fields: name, basePrice, and category are required');
      
      await expect(createMenuItem('Name', 'Description', null, 'category-id'))
        .rejects
        .toThrow('Missing required fields: name, basePrice, and category are required');
      
      await expect(createMenuItem('Name', 'Description', 9.99, null))
        .rejects
        .toThrow('Missing required fields: name, basePrice, and category are required');
    });

    it('should handle validation errors from mongoose', async () => {
      // Arrange
      const validationError = new Error('Validation error');
      validationError.name = 'ValidationError';
      validationError.errors = {
        name: { message: 'Name is required' },
        basePrice: { message: 'Price must be positive' }
      };

      const mockItem = {
        save: jest.fn().mockRejectedValue(validationError)
      };
      
      Item.mockImplementation(() => mockItem);

      // Act & Assert
      await expect(createMenuItem('Test', 'Description', 9.99, 'category-id'))
        .rejects
        .toThrow('Validation error: Name is required, Price must be positive');
    });

    it('should handle duplicate key errors', async () => {
      // Arrange
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      duplicateError.keyValue = { name: 'Test Item' };

      const mockItem = {
        save: jest.fn().mockRejectedValue(duplicateError)
      };
      
      Item.mockImplementation(() => mockItem);

      // Act & Assert
      await expect(createMenuItem('Test Item', 'Description', 9.99, 'category-id'))
        .rejects
        .toThrow('Menu item with this name already exists');
    });
  });

  describe('getMenuItemById', () => {
    it('should return a menu item when valid ID is provided', async () => {
      // Arrange
      const mockItem = {
        _id: 'valid-id',
        name: 'Test Item',
        description: 'Test Description',
        basePrice: 9.99
      };
      
      Item.findById = jest.fn().mockResolvedValue(mockItem);

      // Act
      const result = await getMenuItemById('valid-id');

      // Assert
      expect(Item.findById).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockItem);
    });

    it('should throw an error when menu item ID is not provided', async () => {
      // Act & Assert
      await expect(getMenuItemById())
        .rejects
        .toThrow('Menu item ID is required');
    });

    it('should throw an error when menu item is not found', async () => {
      // Arrange
      Item.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(getMenuItemById('non-existent-id'))
        .rejects
        .toThrow('Menu item with ID non-existent-id not found');
    });

    it('should handle invalid ObjectId format errors', async () => {
      // Arrange
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      
      Item.findById = jest.fn().mockRejectedValue(castError);

      // Act & Assert
      await expect(getMenuItemById('invalid-id-format'))
        .rejects
        .toThrow('Invalid menu item ID format: invalid-id-format');
    });
  });

  describe('getAllMenuItems', () => {
    it('should return all menu items when no limit is provided', async () => {
      // Arrange
      const mockItems = [
        { _id: 'id1', name: 'Item 1' },
        { _id: 'id2', name: 'Item 2' }
      ];
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      
      Item.find = jest.fn().mockReturnValue(mockQuery);
      mockQuery.exec = jest.fn().mockResolvedValue(mockItems);

      // Act
      const result = await getAllMenuItems();

      // Assert
      expect(Item.find).toHaveBeenCalled();
      expect(mockQuery.limit).not.toHaveBeenCalled();
      expect(result).toEqual(mockItems);
    });

    it('should return limited menu items when limit is provided', async () => {
      // Arrange
      const mockItems = [
        { _id: 'id1', name: 'Item 1' },
        { _id: 'id2', name: 'Item 2' }
      ];
      
      const mockFind = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockItems)
      });
      
      Item.find = mockFind;

      // Act
      const result = await getAllMenuItems(2);

      // Assert
      expect(mockFind).toHaveBeenCalled();
      expect(mockFind().limit).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockItems);
    });

    it('should throw an error when limit is invalid', async () => {
      // Act & Assert
      await expect(getAllMenuItems(-1))
        .rejects
        .toThrow('Limit must be a positive number');
      
      await expect(getAllMenuItems('not-a-number'))
        .rejects
        .toThrow('Limit must be a positive number');
    });
  });

  describe('updateMenuItem', () => {
    it('should update a menu item with valid data', async () => {
      // Arrange
      const mockUpdatedItem = {
        _id: 'valid-id',
        name: 'Updated Item',
        description: 'Updated Description',
        basePrice: 12.99
      };
      
      Item.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedItem);

      // Act
      const result = await updateMenuItem('valid-id', {
        name: 'Updated Item',
        description: 'Updated Description',
        basePrice: 12.99
      });

      // Assert
      expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
        'valid-id',
        {
          name: 'Updated Item',
          description: 'Updated Description',
          basePrice: 12.99
        },
        {
          new: true,
          runValidators: true
        }
      );
      expect(result).toEqual(mockUpdatedItem);
    });

    it('should throw an error when menu item ID is not provided', async () => {
      // Act & Assert
      await expect(updateMenuItem(null, { name: 'Updated Item' }))
        .rejects
        .toThrow('Menu item ID is required');
    });

    it('should throw an error when update data is not provided', async () => {
      // Act & Assert
      await expect(updateMenuItem('valid-id', null))
        .rejects
        .toThrow('No update data provided');
      
      await expect(updateMenuItem('valid-id', {}))
        .rejects
        .toThrow('No update data provided');
    });

    it('should throw an error when menu item is not found', async () => {
      // Arrange
      Item.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(updateMenuItem('non-existent-id', { name: 'Updated Item' }))
        .rejects
        .toThrow('Menu item with ID non-existent-id not found');
    });

    it('should handle validation errors from mongoose', async () => {
      // Arrange
      const validationError = new Error('Validation error');
      validationError.name = 'ValidationError';
      validationError.errors = {
        name: { message: 'Name is required' },
        basePrice: { message: 'Price must be positive' }
      };
      
      Item.findByIdAndUpdate = jest.fn().mockRejectedValue(validationError);

      // Act & Assert
      await expect(updateMenuItem('valid-id', { name: '', basePrice: -1 }))
        .rejects
        .toThrow('Validation error: Name is required, Price must be positive');
    });

    it('should handle invalid ObjectId format errors', async () => {
      // Arrange
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      
      Item.findByIdAndUpdate = jest.fn().mockRejectedValue(castError);

      // Act & Assert
      await expect(updateMenuItem('invalid-id-format', { name: 'Updated Item' }))
        .rejects
        .toThrow('Invalid menu item ID format: invalid-id-format');
    });

    it('should handle duplicate key errors', async () => {
      // Arrange
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      duplicateError.keyValue = { name: 'Existing Item' };
      
      Item.findByIdAndUpdate = jest.fn().mockRejectedValue(duplicateError);

      // Act & Assert
      await expect(updateMenuItem('valid-id', { name: 'Existing Item' }))
        .rejects
        .toThrow('Update would create a duplicate name');
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete a menu item when valid ID is provided', async () => {
      // Arrange
      const mockDeletedItem = {
        _id: 'valid-id',
        name: 'Item to Delete',
        description: 'Description',
        basePrice: 9.99
      };
      
      Item.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedItem);

      // Act
      const result = await deleteMenuItem('valid-id');

      // Assert
      expect(Item.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockDeletedItem);
    });

    it('should throw an error when menu item ID is not provided', async () => {
      // Act & Assert
      await expect(deleteMenuItem())
        .rejects
        .toThrow('Menu item ID is required');
    });

    it('should throw an error when menu item is not found', async () => {
      // Arrange
      Item.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(deleteMenuItem('non-existent-id'))
        .rejects
        .toThrow('Menu item with ID non-existent-id not found or already deleted');
    });

    it('should handle invalid ObjectId format errors', async () => {
      // Arrange
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      
      Item.findByIdAndDelete = jest.fn().mockRejectedValue(castError);

      // Act & Assert
      await expect(deleteMenuItem('invalid-id-format'))
        .rejects
        .toThrow('Invalid menu item ID format: invalid-id-format');
    });
  });
});
