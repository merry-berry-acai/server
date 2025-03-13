const { validateCategory } = require('../../middlewares/validateItemCategory');
const { Category } = require('../../models/CategoryModel');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../models/CategoryModel', () => ({
  Category: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    lean: jest.fn()
  }
}));

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

describe('validateItemCategory Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      body: {},
      categoryId: null
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

  it('should return 400 when category is not provided', async () => {
    // Arrange
    req.body = { name: 'Test Item', price: 9.99 }; // No category
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Category is required'
    }));
  });

  it('should find category by ID when valid ObjectId is provided', async () => {
    // Arrange
    const categoryId = '60d21b4667d0d8992e610c85';
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      category: categoryId
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    
    const mockCategory = { 
      _id: categoryId,
      name: 'Test Category'
    };
    Category.findById.mockResolvedValue(mockCategory);
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(categoryId);
    expect(Category.findById).toHaveBeenCalledWith(categoryId);
    expect(req.categoryId).toBe(mockCategory._id);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should find category by name when ID lookup fails', async () => {
    // Arrange
    const categoryName = 'Test Category';
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      category: categoryName
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    
    const mockCategory = { 
      _id: '60d21b4667d0d8992e610c85',
      name: categoryName
    };
    Category.findOne.mockResolvedValue(mockCategory);
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(categoryName);
    expect(Category.findById).not.toHaveBeenCalled();
    expect(Category.findOne).toHaveBeenCalledWith({ name: categoryName });
    expect(req.categoryId).toBe(mockCategory._id);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should find category by name when valid ObjectId is provided but not found', async () => {
    // Arrange
    const categoryId = '60d21b4667d0d8992e610c85';
    const categoryName = 'Test Category';
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      category: categoryName
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Category.findById.mockResolvedValue(null);
    
    const mockCategory = { 
      _id: categoryId,
      name: categoryName
    };
    Category.findOne.mockResolvedValue(mockCategory);
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(categoryName);
    expect(Category.findById).toHaveBeenCalledWith(categoryName);
    expect(Category.findOne).toHaveBeenCalledWith({ name: categoryName });
    expect(req.categoryId).toBe(mockCategory._id);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 404 with available categories when category is not found', async () => {
    // Arrange
    const categoryName = 'Nonexistent Category';
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      category: categoryName
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    Category.findOne.mockResolvedValue(null);
    
    const availableCategories = [
      { name: 'Category 1' },
      { name: 'Category 2' },
      { name: 'Category 3' }
    ];
    Category.find.mockReturnThis();
    Category.lean.mockResolvedValue(availableCategories);
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(Category.findOne).toHaveBeenCalledWith({ name: categoryName });
    expect(Category.find).toHaveBeenCalledWith({}, 'name');
    expect(console.error).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: `Category '${categoryName}' not found.`,
      availableCategories: 'Category 1, Category 2, Category 3'
    }));
  });

  it('should return "No categories available" when no categories exist', async () => {
    // Arrange
    const categoryName = 'Nonexistent Category';
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      category: categoryName
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    Category.findOne.mockResolvedValue(null);
    Category.find.mockReturnThis();
    Category.lean.mockResolvedValue([]);
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(Category.find).toHaveBeenCalledWith({}, 'name');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      availableCategories: 'No categories available'
    }));
  });

  it('should handle errors and return 500', async () => {
    // Arrange
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      category: 'Test Category'
    };
    
    const error = new Error('Database error');
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    Category.findOne.mockRejectedValue(error);
    
    // Act
    await validateCategory(req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Internal server error while validating category',
      details: error.message
    }));
  });
});
