const {
  createTopping,
  getToppingById,
  getAllToppings,
  updateTopping,
  deleteTopping
} = require('../../controllers/toppingController');

// Mock the Topping model
jest.mock('../../models/ToppingModel', () => {
  const mockSave = jest.fn();
  const mockTopping = {
    save: mockSave,
    _id: 'mock-id',
    name: 'Mock Topping',
    price: 1.99,
    availability: true,
    toObject: () => ({
      _id: 'mock-id',
      name: 'Mock Topping',
      price: 1.99,
      availability: true
    })
  };

  return {
    Topping: {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      mockImplementation: () => mockTopping
    }
  };
});

// Get the mocked model
const { Topping } = require('../../models/ToppingModel');

describe('Topping Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createTopping', () => {
    it('should create a new topping with valid data', async () => {
      // Arrange
      const mockTopping = {
        _id: 'mock-id',
        name: 'Test Topping',
        price: 2.99,
        availability: true,
        save: jest.fn().mockResolvedValue(true)
      };
      
      Topping.mockImplementation = () => mockTopping;

      // Act
      const result = await createTopping('Test Topping', 2.99, true);

      // Assert
      expect(Topping).toHaveBeenCalledWith({
        name: 'Test Topping',
        price: 2.99,
        availability: true
      });
      expect(mockTopping.save).toHaveBeenCalled();
      expect(result).toEqual(mockTopping);
    });

    it('should create a topping with default values when only name is provided', async () => {
      // Arrange
      const mockTopping = {
        _id: 'mock-id',
        name: 'Test Topping',
        price: 0,
        availability: true,
        save: jest.fn().mockResolvedValue(true)
      };
      
      Topping.mockImplementation = () => mockTopping;

      // Act
      const result = await createTopping('Test Topping');

      // Assert
      expect(Topping).toHaveBeenCalledWith({
        name: 'Test Topping',
        price: 0,
        availability: true
      });
      expect(mockTopping.save).toHaveBeenCalled();
      expect(result).toEqual(mockTopping);
    });

    it('should throw an error when save fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockTopping = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      
      Topping.mockImplementation = () => mockTopping;

      // Act & Assert
      await expect(createTopping('Test Topping', 2.99)).rejects.toThrow('Failed to create topping');
    });
  });

  describe('getToppingById', () => {
    it('should return a topping when valid ID is provided', async () => {
      // Arrange
      const mockTopping = {
        _id: 'valid-id',
        name: 'Test Topping',
        price: 2.99,
        availability: true
      };
      
      Topping.findById.mockResolvedValue(mockTopping);

      // Act
      const result = await getToppingById('valid-id');

      // Assert
      expect(Topping.findById).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockTopping);
    });

    it('should throw an error when topping is not found', async () => {
      // Arrange
      Topping.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getToppingById('non-existent-id')).rejects.toThrow('Topping not found');
    });

    it('should throw an error when findById fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Topping.findById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getToppingById('valid-id')).rejects.toThrow('Failed to fetch topping');
    });
  });

  describe('getAllToppings', () => {
    it('should return all toppings', async () => {
      // Arrange
      const mockToppings = [
        { _id: 'id1', name: 'Topping 1', price: 1.99 },
        { _id: 'id2', name: 'Topping 2', price: 2.99 }
      ];
      
      Topping.find.mockResolvedValue(mockToppings);

      // Act
      const result = await getAllToppings();

      // Assert
      expect(Topping.find).toHaveBeenCalled();
      expect(result).toEqual(mockToppings);
    });

    it('should throw an error when find fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Topping.find.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getAllToppings()).rejects.toThrow('Failed to fetch toppings');
    });
  });

  describe('updateTopping', () => {
    it('should update a topping with valid data', async () => {
      // Arrange
      const mockUpdatedTopping = {
        _id: 'valid-id',
        name: 'Updated Topping',
        price: 3.99,
        availability: false
      };
      
      Topping.findByIdAndUpdate.mockResolvedValue(mockUpdatedTopping);

      // Act
      const result = await updateTopping('valid-id', {
        name: 'Updated Topping',
        price: 3.99,
        availability: false
      });

      // Assert
      expect(Topping.findByIdAndUpdate).toHaveBeenCalledWith(
        'valid-id',
        {
          name: 'Updated Topping',
          price: 3.99,
          availability: false
        },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedTopping);
    });

    it('should throw an error when topping is not found', async () => {
      // Arrange
      Topping.findByIdAndUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(updateTopping('non-existent-id', { name: 'Updated Topping' }))
        .rejects
        .toThrow('Topping not found or update failed');
    });

    it('should throw an error when findByIdAndUpdate fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Topping.findByIdAndUpdate.mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateTopping('valid-id', { name: 'Updated Topping' }))
        .rejects
        .toThrow('Failed to update topping');
    });
  });

  describe('deleteTopping', () => {
    it('should delete a topping when valid ID is provided', async () => {
      // Arrange
      const mockDeletedTopping = {
        _id: 'valid-id',
        name: 'Topping to Delete',
        price: 1.99,
        availability: true
      };
      
      Topping.findByIdAndDelete.mockResolvedValue(mockDeletedTopping);

      // Act
      const result = await deleteTopping('valid-id');

      // Assert
      expect(Topping.findByIdAndDelete).toHaveBeenCalledWith('valid-id');
      expect(result).toEqual(mockDeletedTopping);
    });

    it('should throw an error when topping is not found', async () => {
      // Arrange
      Topping.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteTopping('non-existent-id'))
        .rejects
        .toThrow('Topping not found or already deleted');
    });

    it('should throw an error when findByIdAndDelete fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      Topping.findByIdAndDelete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteTopping('valid-id'))
        .rejects
        .toThrow('Failed to delete topping');
    });
  });
});
