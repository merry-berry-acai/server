const { validateToppings } = require('../../middlewares/validateToppings');
const { Topping } = require('../../models/ToppingModel');

// Mock dependencies
jest.mock('../../models/ToppingModel', () => ({
  Topping: {
    find: jest.fn().mockReturnThis(),
    lean: jest.fn()
  }
}));

describe('validateToppings Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      body: {},
      toppingIds: null
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

  it('should call next() when no toppings are provided', async () => {
    // Arrange
    req.body = { name: 'Test Item', price: 9.99 }; // No toppings
    
    // Act
    await validateToppings(req, res, next);
    
    // Assert
    expect(Topping.find).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 when toppings is not an array', async () => {
    // Arrange
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      toppings: 'Chocolate' // String instead of array
    };
    
    // Act
    await validateToppings(req, res, next);
    
    // Assert
    expect(Topping.find).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Toppings must be an array of names.'
    }));
  });

  it('should call next() when all toppings are valid', async () => {
    // Arrange
    const toppingNames = ['Chocolate', 'Strawberry', 'Banana'];
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      toppings: toppingNames
    };
    
    const mockToppings = [
      { _id: '60d21b4667d0d8992e610c85', name: 'Chocolate' },
      { _id: '60d21b4667d0d8992e610c86', name: 'Strawberry' },
      { _id: '60d21b4667d0d8992e610c87', name: 'Banana' }
    ];
    
    Topping.find.mockReturnThis();
    Topping.lean.mockResolvedValue(mockToppings);
    
    // Act
    await validateToppings(req, res, next);
    
    // Assert
    expect(Topping.find).toHaveBeenCalledWith(
      { name: { $in: toppingNames } },
      '_id name'
    );
    expect(req.toppingIds).toEqual([
      '60d21b4667d0d8992e610c85',
      '60d21b4667d0d8992e610c86',
      '60d21b4667d0d8992e610c87'
    ]);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 404 when some toppings are not found', async () => {
    // Arrange
    const toppingNames = ['Chocolate', 'Nonexistent Topping', 'Banana'];
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      toppings: toppingNames
    };
    
    const mockToppings = [
      { _id: '60d21b4667d0d8992e610c85', name: 'Chocolate' },
      { _id: '60d21b4667d0d8992e610c87', name: 'Banana' }
    ];
    
    Topping.find.mockReturnThis();
    Topping.lean.mockResolvedValueOnce(mockToppings);
    
    const availableToppings = [
      { name: 'Chocolate' },
      { name: 'Strawberry' },
      { name: 'Banana' },
      { name: 'Nuts' }
    ];
    
    Topping.find.mockReturnThis();
    Topping.lean.mockResolvedValueOnce(availableToppings);
    
    // Act
    await validateToppings(req, res, next);
    
    // Assert
    expect(Topping.find).toHaveBeenCalledTimes(2);
    expect(Topping.find).toHaveBeenNthCalledWith(
      1,
      { name: { $in: toppingNames } },
      '_id name'
    );
    expect(Topping.find).toHaveBeenNthCalledWith(
      2,
      {},
      'name'
    );
    expect(console.error).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Some toppings were not found: Nonexistent Topping'),
      availableToppings: ['Chocolate', 'Strawberry', 'Banana', 'Nuts']
    }));
  });

  it('should return "No toppings available" when no toppings exist', async () => {
    // Arrange
    const toppingNames = ['Nonexistent Topping'];
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      toppings: toppingNames
    };
    
    Topping.find.mockReturnThis();
    Topping.lean.mockResolvedValueOnce([]);
    Topping.find.mockReturnThis();
    Topping.lean.mockResolvedValueOnce([]);
    
    // Act
    await validateToppings(req, res, next);
    
    // Assert
    expect(Topping.find).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Some toppings were not found'),
      availableToppings: []
    }));
  });

  it('should handle errors and return 500', async () => {
    // Arrange
    req.body = { 
      name: 'Test Item', 
      price: 9.99,
      toppings: ['Chocolate', 'Strawberry']
    };
    
    const error = new Error('Database error');
    Topping.find.mockReturnThis();
    Topping.lean.mockRejectedValue(error);
    
    // Act
    await validateToppings(req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Internal server error: Database error')
    }));
  });
});
