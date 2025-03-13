const requestLogger = require('../../middlewares/requestLogger');
const Logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
jest.mock('../../utils/logger');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123')
}));

describe('Request Logger Middleware', () => {
  let req, res, next;
  let originalSend;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test doubles
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      body: {},
      get: jest.fn().mockImplementation((header) => {
        if (header === 'User-Agent') return 'Test User Agent';
        if (header === 'Content-Type') return 'application/json';
        return null;
      }),
      requestTime: null
    };
    
    res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      statusCode: 200
    };
    
    next = jest.fn();

    // Store original Date.now
    originalDateNow = Date.now;
    Date.now = jest.fn().mockReturnValue(1000); // Mock start time

    // Store original process.env
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restore Date.now
    Date.now = originalDateNow;
    
    // Restore process.env
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should generate a request ID and log incoming request', () => {
    // Act
    requestLogger(req, res, next);
    
    // Assert
    expect(uuidv4).toHaveBeenCalled();
    expect(req.id).toBe('test-uuid-123');
    expect(req.requestTime).toBe(1000);
    expect(Logger.info).toHaveBeenCalledWith(
      'Incoming GET request to /api/test',
      expect.objectContaining({
        requestId: 'test-uuid-123',
        ip: '127.0.0.1',
        userAgent: 'Test User Agent',
        contentType: 'application/json'
      })
    );
    expect(next).toHaveBeenCalled();
  });

  it('should log request body at debug level (excluding sensitive data)', () => {
    // Arrange
    req.body = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123',
      token: 'jwt-token',
      credit_card: '4111111111111111',
      secret: 'api-key'
    };
    
    // Act
    requestLogger(req, res, next);
    
    // Assert
    expect(Logger.debug).toHaveBeenCalledWith(
      'Request payload',
      expect.objectContaining({
        requestId: 'test-uuid-123',
        body: expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          password: '[REDACTED]',
          token: '[REDACTED]',
          credit_card: '[REDACTED]',
          secret: '[REDACTED]'
        })
      })
    );
  });

  it('should not log request body when empty', () => {
    // Arrange
    req.body = {};
    
    // Act
    requestLogger(req, res, next);
    
    // Assert
    expect(Logger.debug).not.toHaveBeenCalledWith('Request payload', expect.anything());
  });

  it('should override res.send and log response time', () => {
    // Arrange
    requestLogger(req, res, next);
    
    // Simulate response being sent after 500ms
    Date.now = jest.fn().mockReturnValue(1500);
    
    // Act
    res.send('Test response');
    
    // Assert
    expect(Logger.request).toHaveBeenCalledWith(
      'GET',
      '/api/test',
      200,
      'guest', // Default when no user ID
      500 // Response time (1500 - 1000)
    );
  });

  it('should use userId or firebaseUid when available', () => {
    // Arrange
    req.userId = 'user-123';
    req.firebaseUid = 'firebase-uid-123';
    requestLogger(req, res, next);
    
    // Simulate response being sent
    res.send('Test response');
    
    // Assert
    expect(Logger.request).toHaveBeenCalledWith(
      'GET',
      '/api/test',
      200,
      'user-123', // Uses userId when available
      0
    );
  });

  it('should use firebaseUid when userId is not available', () => {
    // Arrange
    req.userId = null;
    req.firebaseUid = 'firebase-uid-123';
    requestLogger(req, res, next);
    
    // Simulate response being sent
    res.send('Test response');
    
    // Assert
    expect(Logger.request).toHaveBeenCalledWith(
      'GET',
      '/api/test',
      200,
      'firebase-uid-123', // Uses firebaseUid when userId not available
      0
    );
  });

  it('should log response payload in non-production environment for JSON responses', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    requestLogger(req, res, next);
    
    // Act
    res.send(JSON.stringify({ success: true, data: 'test' }));
    
    // Assert
    expect(Logger.debug).toHaveBeenCalledWith(
      'Response payload for test-uuid-123',
      expect.objectContaining({
        requestId: 'test-uuid-123',
        responseSize: expect.any(Number),
        responseType: 'object'
      })
    );
  });

  it('should log non-JSON responses differently', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    requestLogger(req, res, next);
    
    // Act
    res.send('Plain text response');
    
    // Assert
    expect(Logger.debug).toHaveBeenCalledWith(
      'Non-JSON response for test-uuid-123',
      expect.objectContaining({
        requestId: 'test-uuid-123',
        responseSize: expect.any(Number)
      })
    );
  });

  it('should not log response payload in production environment', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    requestLogger(req, res, next);
    
    // Reset debug mock to check it's not called for response
    Logger.debug.mockClear();
    
    // Act
    res.send(JSON.stringify({ success: true, data: 'test' }));
    
    // Assert
    expect(Logger.debug).not.toHaveBeenCalledWith(
      expect.stringContaining('Response payload'),
      expect.anything()
    );
  });
});
