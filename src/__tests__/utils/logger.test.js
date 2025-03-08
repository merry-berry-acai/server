const Logger = require('../../utils/logger');
const chalk = require('chalk');

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

describe('Logger Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Save original environment
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });
  
  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getTimestamp', () => {
    it('should return a formatted timestamp string', () => {
      // Arrange
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Act
      const result = Logger.getTimestamp();

      // Assert
      expect(result).toBe('2023-01-01 12:00:00');

      // Cleanup
      global.Date.mockRestore();
    });
  });

  describe('info', () => {
    it('should log an info message with blue color', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');

      // Act
      Logger.info('Test info message');

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] 2023-01-01 12:00:00: Test info message')
      );
      expect(console.log.mock.calls[0][0]).toContain(chalk.blue('[INFO]'));
    });

    it('should include context data when provided', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const contextData = { userId: '123', action: 'login' };

      // Act
      Logger.info('User logged in', contextData);

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[userId=123, action=login]')
      );
    });
  });

  describe('success', () => {
    it('should log a success message with green color', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');

      // Act
      Logger.success('Operation completed');

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[SUCCESS] 2023-01-01 12:00:00: Operation completed')
      );
      expect(console.log.mock.calls[0][0]).toContain(chalk.green('[SUCCESS]'));
    });

    it('should include context data when provided', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const contextData = { duration: '500ms', items: 5 };

      // Act
      Logger.success('Items processed', contextData);

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[duration=500ms, items=5]')
      );
    });
  });

  describe('error', () => {
    it('should log an error message with red color', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');

      // Act
      Logger.error('Something went wrong');

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] 2023-01-01 12:00:00: Something went wrong')
      );
      expect(console.error.mock.calls[0][0]).toContain(chalk.red('[ERROR]'));
    });

    it('should include error details when error object is provided', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const error = new Error('Database connection failed');

      // Act
      Logger.error('Failed to connect', error);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error details: Database connection failed')
      );
    });

    it('should include stack trace in debug mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      Logger.isDebugEnabled = true;
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at TestFunction';

      // Act
      Logger.error('Error occurred', error);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error: Test error\n    at TestFunction')
      );
    });

    it('should not include stack trace in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      Logger.isDebugEnabled = false;
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at TestFunction';

      // Act
      Logger.error('Error occurred', error);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.not.stringContaining('at TestFunction')
      );
    });

    it('should include context data when provided', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const contextData = { component: 'auth', method: 'login' };

      // Act
      Logger.error('Authentication failed', null, contextData);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[component=auth, method=login]')
      );
    });
  });

  describe('warn', () => {
    it('should log a warning message with yellow color', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');

      // Act
      Logger.warn('Deprecated feature used');

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] 2023-01-01 12:00:00: Deprecated feature used')
      );
      expect(console.log.mock.calls[0][0]).toContain(chalk.yellow('[WARN]'));
    });

    it('should include context data when provided', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const contextData = { feature: 'oldAPI', user: 'admin' };

      // Act
      Logger.warn('Using deprecated API', contextData);

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[feature=oldAPI, user=admin]')
      );
    });
  });

  describe('debug', () => {
    it('should log debug message in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      Logger.isDebugEnabled = true;
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');

      // Act
      Logger.debug('Debug information');

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] 2023-01-01 12:00:00: Debug information')
      );
      expect(console.log.mock.calls[0][0]).toContain(chalk.cyan('[DEBUG]'));
    });

    it('should not log debug message in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      Logger.isDebugEnabled = false;
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');

      // Act
      Logger.debug('Debug information');

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should include data object when provided', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      Logger.isDebugEnabled = true;
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      const data = { key1: 'value1', key2: 'value2' };

      // Act
      Logger.debug('Debug with data', data);

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(data, null, 2))
      );
    });

    it('should handle non-stringifiable data', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      Logger.isDebugEnabled = true;
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      
      // Create circular reference
      const circularData = {};
      circularData.self = circularData;

      // Mock JSON.stringify to throw error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn().mockImplementation(() => {
        throw new Error('Circular structure');
      });

      // Act
      Logger.debug('Debug with circular data', circularData);

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Data could not be stringified]')
      );

      // Restore original
      JSON.stringify = originalStringify;
    });
  });

  describe('request', () => {
    it('should log HTTP request with appropriate colors based on status code', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      
      // Act - Test different status codes
      Logger.request('GET', '/api/users', 200);
      Logger.request('POST', '/api/auth', 201);
      Logger.request('PUT', '/api/items/1', 304);
      Logger.request('DELETE', '/api/items/1', 400);
      Logger.request('GET', '/api/unknown', 404);
      Logger.request('POST', '/api/error', 500);

      // Assert
      expect(console.log).toHaveBeenCalledTimes(6);
      
      // 2xx status (green)
      expect(console.log.mock.calls[0][0]).toContain('GET /api/users');
      expect(console.log.mock.calls[0][0]).toContain(chalk.green('200'));
      
      expect(console.log.mock.calls[1][0]).toContain('POST /api/auth');
      expect(console.log.mock.calls[1][0]).toContain(chalk.green('201'));
      
      // 3xx status (cyan)
      expect(console.log.mock.calls[2][0]).toContain('PUT /api/items/1');
      expect(console.log.mock.calls[2][0]).toContain(chalk.cyan('304'));
      
      // 4xx status (yellow)
      expect(console.log.mock.calls[3][0]).toContain('DELETE /api/items/1');
      expect(console.log.mock.calls[3][0]).toContain(chalk.yellow('400'));
      
      expect(console.log.mock.calls[4][0]).toContain('GET /api/unknown');
      expect(console.log.mock.calls[4][0]).toContain(chalk.yellow('404'));
      
      // 5xx status (red)
      expect(console.log.mock.calls[5][0]).toContain('POST /api/error');
      expect(console.log.mock.calls[5][0]).toContain(chalk.red('500'));
    });

    it('should include user ID when provided', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      
      // Act
      Logger.request('GET', '/api/profile', 200, 'user-123');

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('User: user-123')
      );
    });

    it('should include response time with appropriate color', () => {
      // Arrange
      jest.spyOn(Logger, 'getTimestamp').mockReturnValue('2023-01-01 12:00:00');
      
      // Act - Test different response times
      Logger.request('GET', '/api/fast', 200, null, 50);
      Logger.request('GET', '/api/medium', 200, null, 600);
      Logger.request('GET', '/api/slow', 200, null, 1500);

      // Assert
      expect(console.log).toHaveBeenCalledTimes(3);
      
      // Fast response (green)
      expect(console.log.mock.calls[0][0]).toContain(chalk.green('50ms'));
      
      // Medium response (yellow)
      expect(console.log.mock.calls[1][0]).toContain(chalk.yellow('600ms'));
      
      // Slow response (red)
      expect(console.log.mock.calls[2][0]).toContain(chalk.red('1500ms'));
    });
  });

  describe('_formatContext', () => {
    it('should return empty string for empty context', () => {
      // Act
      const result = Logger._formatContext({});

      // Assert
      expect(result).toBe('');
    });

    it('should format context data as key-value pairs', () => {
      // Arrange
      const contextData = {
        userId: '123',
        action: 'login',
        timestamp: 1609459200000
      };

      // Act
      const result = Logger._formatContext(contextData);

      // Assert
      expect(result).toContain('userId=123');
      expect(result).toContain('action=login');
      expect(result).toContain('timestamp=1609459200000');
    });

    it('should stringify object values', () => {
      // Arrange
      const contextData = {
        user: { id: '123', name: 'Test User' },
        meta: { source: 'web' }
      };

      // Act
      const result = Logger._formatContext(contextData);

      // Assert
      expect(result).toContain('user={"id":"123","name":"Test User"}');
      expect(result).toContain('meta={"source":"web"}');
    });

    it('should handle errors when formatting context', () => {
      // Arrange
      const circularObj = {};
      circularObj.self = circularObj;
      
      // Mock JSON.stringify to throw error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn().mockImplementation(() => {
        throw new Error('Circular structure');
      });

      // Act
      const result = Logger._formatContext({ problematic: circularObj });

      // Assert
      expect(result).toContain('[Context data error]');

      // Restore original
      JSON.stringify = originalStringify;
    });
  });
});
