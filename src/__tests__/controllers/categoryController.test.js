const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../../controllers/categoryController');

// Mock the Category model
jest.mock('../../models/CategoryModel', () => {
  const mockSave = jest.fn();
  const mockCategory = {
    save: mockSave,
    _id: 'mock-id',
    name: 'mock-category',
    toObject: () => ({
      _id: 'mock-id',
      name: 'mock-category'
    })
  };

  const CategoryMock = jest.fn().mockImplementation(data => {
    return {
      ...mockCategory,
      ...data,
      save: mockSave
    };
  });

  // Add static methods
  CategoryMock.find = jest.fn();
  CategoryMock.findById = jest.fn();
  CategoryMock.findOne = jest.fn();
  CategoryMock.findByIdAndUpdate = jest.fn();
  CategoryMock.findByIdAndDelete = jest.fn();

  return {
    Category: CategoryMock
  };
});

// Get the mocked model
const { Category } = require('../../models/CategoryModel');

describe('Category Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a new category with valid data', async () => {
      // Arrange
      const mockSave = jest.fn().mockResolvedValue(true);
      Category.mockImplementation(data => ({
        _id: 'mock-id',
        ...data,
        save: mockSave
      }));
      Category.findOne = jest.fn().mockResolvedValue(null); // No existing category

      // Act
      const result = await createCategory('Test Category');

      // Assert
      expect(Category.findOne).toHaveBeenCalledWith({ name: 'test category' });
      expect(result.name).toBe('test category');
    });

    it('should return an error when category already exists', async () => {
      // Arrange
      const existingCategory = {
        _id: 'existing-id',
        name: 'existing-category'
      };
      
      Category.findOne.mockResolvedValue(existingCategory);

      // Act
      const result = await createCategory('Existing Category');

      // Assert
      expect(Category.findOne).toHaveBeenCalledWith({ name: 'existing category' });
      expect(result.status).toBe(400);
      expect(result.error).toBe("Category 'existing category' already exists");
    });

    it('should throw an error when save fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Category.findOne = jest.fn().mockResolvedValue(null);
      const mockSave = jest.fn().mockRejectedValue(mockError);
      
      Category.mockImplementation(data => ({
        ...data,
        save: mockSave
      }));

      // Act & Assert
      await expect(createCategory('Test Category')).rejects.toThrow('Failed to create category');
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      // Arrange
      const mockCategories = [
        { _id: 'id1', name: 'Category 1' },
        { _id: 'id2', name: 'Category 2' }
      ];
      
      Category.find.mockResolvedValue(mockCategories);

      // Act
      const result = await getAllCategories();

      // Assert
      expect(Category.find).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should throw an error when find fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Category.find.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getAllCategories()).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('getCategoryById', () => {
    it('should return a category when valid ID is provided', async () => {
      // Arrange
      const mockCategory = {
        _id: 'valid-id',
        name: 'Test Category'
      };
      
      Category.findById.mockResolvedValue(mockCategory);

      // Act
      const result = await getCategoryById('valid-id');

      // Assert
      expect(Category.findById).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockCategory);
    });

    it('should throw an error when category is not found', async () => {
      // Arrange
      Category.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getCategoryById('non-existent-id')).rejects.toThrow('Failed to fetch category');
    });

    it('should throw an error when findById fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Category.findById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getCategoryById('valid-id')).rejects.toThrow('Failed to fetch category');
    });
  });

  describe('updateCategory', () => {
    it('should update a category with valid data', async () => {
      // Arrange
      const mockUpdatedCategory = {
        _id: 'valid-id',
        name: 'updated-category'
      };
      
      Category.findByIdAndUpdate.mockResolvedValue(mockUpdatedCategory);

      // Act
      const result = await updateCategory('valid-id', 'Updated Category');

      // Assert
      expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
        'valid-id',
        { name: 'updated category' },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedCategory);
    });

    it('should throw an error when category is not found', async () => {
      // Arrange
      Category.findByIdAndUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(updateCategory('non-existent-id', 'Updated Category')).rejects.toThrow('Failed to update category');
    });

    it('should throw an error when findByIdAndUpdate fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Category.findByIdAndUpdate.mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateCategory('valid-id', 'Updated Category')).rejects.toThrow('Failed to update category');
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category when valid ID is provided', async () => {
      // Arrange
      const mockDeletedCategory = {
        _id: 'valid-id',
        name: 'Category to Delete'
      };
      
      Category.findByIdAndDelete.mockResolvedValue(mockDeletedCategory);

      // Act
      const result = await deleteCategory('valid-id');

      // Assert
      expect(Category.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockDeletedCategory);
    });

    it('should throw an error when category is not found', async () => {
      // Arrange
      Category.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteCategory('non-existent-id')).rejects.toThrow('Failed to delete category');
    });

    it('should throw an error when findByIdAndDelete fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Category.findByIdAndDelete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteCategory('valid-id')).rejects.toThrow('Failed to delete category');
    });
  });
});
