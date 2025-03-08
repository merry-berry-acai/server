const mongoose = require('mongoose');
const { dbConnect, dbDisconnect, dbDrop } = require('../../utils/database');
const logger = require('../../utils/logger');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    close: jest.fn(),
    db: {
      dropDatabase: jest.fn(),
      databaseName: 'test-db'
    }
  }
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  success: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Database Utility', () => {
  // Save original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('dbConnect', () => {
    it('should connect to the database with default URL when MONGODB_URI is not set', async () => {
      // Arrange
      delete process.env.MONGODB_URI;
      mongoose.connect.mockResolvedValueOnce(undefined);

      // Act
      await dbConnect();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/merry-berry');
      expect(logger.success).toHaveBeenCalledWith(
        'Database connected to mongodb://localhost:27017/merry-berry'
      );
    });

    it('should connect to the database with MONGODB_URI when set', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://custom-host:27017/test-db';
      mongoose.connect.mockResolvedValueOnce(undefined);

      // Act
      await dbConnect();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://custom-host:27017/test-db');
      expect(logger.success).toHaveBeenCalledWith(
        'Database connected to mongodb://custom-host:27017/test-db'
      );
    });

    it('should throw and log error when connection fails', async () => {
      // Arrange
      const mockError = new Error('Connection failed');
      mongoose.connect.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(dbConnect()).rejects.toThrow('Connection failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Cannot connect to the database: Connection failed'
      );
    });
  });

  describe('dbDisconnect', () => {
    it('should disconnect from the database', async () => {
      // Arrange
      mongoose.connection.close.mockResolvedValueOnce(undefined);

      // Act
      await dbDisconnect();

      // Assert
      expect(mongoose.connection.close).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Database disconnected');
    });

    it('should throw and log error when disconnection fails', async () => {
      // Arrange
      const mockError = new Error('Disconnection failed');
      mongoose.connection.close.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(dbDisconnect()).rejects.toThrow('Disconnection failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Error disconnecting from database: Disconnection failed'
      );
    });
  });

  describe('dbDrop', () => {
    it('should drop the database', async () => {
      // Arrange
      mongoose.connection.db.dropDatabase.mockResolvedValueOnce(undefined);

      // Act
      await dbDrop();

      // Assert
      expect(mongoose.connection.db.dropDatabase).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Database test-db dropped');
    });

    it('should throw and log error when dropping fails', async () => {
      // Arrange
      const mockError = new Error('Drop failed');
      mongoose.connection.db.dropDatabase.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(dbDrop()).rejects.toThrow('Drop failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Error dropping database: Drop failed'
      );
    });
  });
});
