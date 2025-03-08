const express = require('express');
const request = require('supertest');
const path = require('path');
const cors = require('cors');

// Mock dependencies
jest.mock('express', () => {
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.json = jest.fn().mockReturnValue('json-middleware');
  mockExpress.urlencoded = jest.fn().mockReturnValue('urlencoded-middleware');
  mockExpress.static = jest.fn().mockReturnValue('static-middleware');
  return mockExpress;
});

jest.mock('cors', () => jest.fn().mockReturnValue('cors-middleware'));
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mocked/path')
}));

jest.mock('./middlewares/requestLogger', () => 'request-logger-middleware');
jest.mock('./middlewares/errorHandler', () => ({
  errorHandler: 'error-handler-middleware',
  notFoundHandler: 'not-found-handler-middleware'
}));
jest.mock('./middlewares/checkUser', () => ({
  checkUserFirebaseUid: 'check-user-firebase-uid-middleware',
  checkUserId: 'check-user-id-middleware'
}));
jest.mock('./utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Mock route modules
jest.mock('./routes/ItemRoutes', () => 'item-routes');
jest.mock('./routes/OrderRoutes', () => 'order-routes');
jest.mock('./routes/UserRoutes', () => 'user-routes');
jest.mock('./routes/ToppingRoutes', () => 'topping-routes');
jest.mock('./routes/CategoryRoutes', () => 'category-routes');
jest.mock('./routes/Payment', () => 'payment-routes');
jest.mock('./routes/ImageRoutes', () => 'image-routes');

// Create mock app
const mockApp = {
  use: jest.fn(),
  get: jest.fn()
};

describe('Server Setup', () => {
  let server;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the module registry before each test
    jest.resetModules();
    
    // Import the server module
    server = require('../server');
  });
  
  it('should set up middleware correctly', () => {
    // Assert
    expect(express.json).toHaveBeenCalled();
    expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
    expect(mockApp.use).toHaveBeenCalledWith('json-middleware');
    expect(mockApp.use).toHaveBeenCalledWith('urlencoded-middleware');
    expect(mockApp.use).toHaveBeenCalledWith('request-logger-middleware');
    
    // CORS middleware
    expect(cors).toHaveBeenCalledWith({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    });
    expect(mockApp.use).toHaveBeenCalledWith('cors-middleware');
    
    // Static files middleware
    expect(express.static).toHaveBeenCalledWith('/mocked/path');
    expect(path.join).toHaveBeenCalledWith(expect.any(String), '../public');
    expect(mockApp.use).toHaveBeenCalledWith('static-middleware');
    
    // Authentication middleware
    expect(mockApp.use).toHaveBeenCalledWith('check-user-firebase-uid-middleware');
    expect(mockApp.use).toHaveBeenCalledWith('check-user-id-middleware');
  });
  
  it('should set up routes correctly', () => {
    // Assert
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(mockApp.use).toHaveBeenCalledWith('/items', 'item-routes');
    expect(mockApp.use).toHaveBeenCalledWith('/orders', 'order-routes');
    expect(mockApp.use).toHaveBeenCalledWith('/users', 'user-routes');
    expect(mockApp.use).toHaveBeenCalledWith('/toppings', 'topping-routes');
    expect(mockApp.use).toHaveBeenCalledWith('/categories', 'category-routes');
    expect(mockApp.use).toHaveBeenCalledWith('/checkout', 'payment-routes');
    expect(mockApp.use).toHaveBeenCalledWith('/api/images', 'image-routes');
  });
  
  it('should set up error handling middleware correctly', () => {
    // Assert
    // Check that error handlers are added after routes
    const useCallsCount = mockApp.use.mock.calls.length;
    
    // Error handler should be second-to-last middleware
    expect(mockApp.use.mock.calls[useCallsCount - 2][0]).toBe('error-handler-middleware');
    
    // Not found handler should be last middleware
    expect(mockApp.use.mock.calls[useCallsCount - 1][0]).toBe('not-found-handler-middleware');
  });
  
  it('should export the app', () => {
    // Assert
    expect(server).toHaveProperty('app');
    expect(server.app).toBe(mockApp);
  });
  
  it('should handle health check route correctly', () => {
    // Get the health check route handler
    const routeHandler = mockApp.get.mock.calls.find(call => call[0] === '/')[1];
    
    // Create mock request and response
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Call the route handler
    routeHandler(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Server is running!',
      timestamp: expect.any(String)
    });
  });
});
