const mongoose = require('mongoose');
const { Item } = require('../../models/MenuItemModel');

// Mock mongoose
jest.mock('mongoose', () => {
  const mockSchema = {
    pre: jest.fn().mockReturnThis(),
    virtual: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis()
  };
  
  const mockSchemaConstructor = jest.fn(() => mockSchema);
  mockSchemaConstructor.Types = {
    ObjectId: 'ObjectId'
  };
  
  const mockModel = jest.fn();
  
  return {
    Schema: mockSchemaConstructor,
    model: mockModel
  };
});

describe('MenuItem Model', () => {
  it('should define the correct schema', () => {
    // Assert
    expect(mongoose.Schema).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.objectContaining({ type: String, required: true }),
        description: expect.objectContaining({ type: String }),
        imageUrl: expect.objectContaining({ 
          type: String, 
          default: expect.any(String) 
        }),
        basePrice: expect.objectContaining({ type: Number, required: true }),
        toppings: expect.arrayContaining([
          expect.objectContaining({ 
            type: 'ObjectId', 
            ref: 'Topping' 
          })
        ]),
        category: expect.objectContaining({ 
          type: 'ObjectId', 
          ref: 'Category', 
          required: true 
        }),
        availability: expect.objectContaining({ type: Boolean, default: true })
      }),
      expect.objectContaining({
        timestamps: true
      })
    );
  });

  it('should register the model with the correct name', () => {
    // Assert
    expect(mongoose.model).toHaveBeenCalledWith('MenuItem', expect.any(Object));
  });

  describe('Item instance', () => {
    let mockItem;

    beforeEach(() => {
      // Create a mock Item instance
      mockItem = new Item({
        name: 'Test Item',
        description: 'Test Description',
        basePrice: 9.99,
        category: 'category-id',
        toppings: ['topping-id'],
        imageUrl: 'test-image-url'
      });
    });

    it('should create a valid item with required fields', () => {
      // Arrange
      const validItem = {
        name: 'Valid Item',
        basePrice: 9.99,
        category: 'category-id'
      };

      // Act
      const item = new Item(validItem);

      // Assert
      expect(item).toBeDefined();
    });

    it('should use default image URL when not provided', () => {
      // Arrange
      const itemWithoutImage = {
        name: 'No Image Item',
        basePrice: 9.99,
        category: 'category-id'
      };

      // Act
      const item = new Item(itemWithoutImage);

      // Assert
      expect(item.imageUrl).toBeDefined();
      expect(item.imageUrl).toContain('item-default.jpg');
    });

    it('should use default availability when not provided', () => {
      // Arrange
      const itemWithoutAvailability = {
        name: 'Available Item',
        basePrice: 9.99,
        category: 'category-id'
      };

      // Act
      const item = new Item(itemWithoutAvailability);

      // Assert
      expect(item.availability).toBeDefined();
      expect(item.availability).toBe(true);
    });

    it('should allow setting availability to false', () => {
      // Arrange
      const unavailableItem = {
        name: 'Unavailable Item',
        basePrice: 9.99,
        category: 'category-id',
        availability: false
      };

      // Act
      const item = new Item(unavailableItem);

      // Assert
      expect(item.availability).toBe(false);
    });

    it('should store timestamps when created', () => {
      // Act
      const item = new Item({
        name: 'Timestamped Item',
        basePrice: 9.99,
        category: 'category-id'
      });

      // Assert
      expect(mongoose.Schema).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          timestamps: true
        })
      );
    });
  });
});
