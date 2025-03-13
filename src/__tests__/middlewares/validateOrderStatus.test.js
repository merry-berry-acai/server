const { validateOrderStatus } = require('../../middlewares/validateOrderStatus');

describe('validateOrderStatus Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      body: {}
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

  it('should return 400 when orderStatus is not provided', () => {
    // Arrange
    req.body = { items: [], totalAmount: 25.99 }; // No orderStatus
    
    // Act
    validateOrderStatus(req, res, next);
    
    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Order status is required'
    }));
  });

  it('should call next() when orderStatus is valid', () => {
    // Arrange
    req.body = { 
      items: [], 
      totalAmount: 25.99,
      orderStatus: 'Pending'
    };
    
    // Act
    validateOrderStatus(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 when orderStatus is invalid', () => {
    // Arrange
    req.body = { 
      items: [], 
      totalAmount: 25.99,
      orderStatus: 'Invalid Status'
    };
    
    // Act
    validateOrderStatus(req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Invalid orderStatus: "Invalid Status"')
    }));
  });

  it('should validate each allowed order status', () => {
    // Test each valid status
    const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
    
    validStatuses.forEach(status => {
      // Reset mocks for each test
      jest.clearAllMocks();
      
      // Arrange
      req.body = { 
        items: [], 
        totalAmount: 25.99,
        orderStatus: status
      };
      
      // Act
      validateOrderStatus(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  it('should be case sensitive when validating order status', () => {
    // Arrange
    req.body = { 
      items: [], 
      totalAmount: 25.99,
      orderStatus: 'pending' // lowercase, should be 'Pending'
    };
    
    // Act
    validateOrderStatus(req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Invalid orderStatus: "pending"')
    }));
  });

  it('should include all valid statuses in the error message', () => {
    // Arrange
    req.body = { 
      items: [], 
      totalAmount: 25.99,
      orderStatus: 'Wrong'
    };
    
    // Act
    validateOrderStatus(req, res, next);
    
    // Assert
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Pending, Processing, Delivered, Cancelled')
    }));
  });
});
