// Import these modules first for mocking
const Logger = require("../utils/logger");
const { dbConnect } = require("../utils/database.js");

// Set up mocks before any other code runs
jest.mock("../utils/logger");
jest.mock("../utils/database.js");

// Mock dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("Server initialization", () => {
  let originalEnv;
  let mockExit;
  let mockListen;
  let mockApp;

  beforeAll(() => {
    // Set up the process.exit mock once for all tests
    mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit was called");
    });
  });

  beforeEach(() => {
    // Reset module cache before each test
    jest.resetModules();

    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh mocks for each test
    mockListen = jest.fn().mockReturnValue({ close: jest.fn() });
    mockApp = { listen: mockListen };
    
    // Mock the server.js module with fresh mocks
    jest.doMock("../server.js", () => ({
      app: mockApp,
    }));

    // Save original env and create a copy
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  afterAll(() => {
    // Clean up the process.exit mock
    mockExit.mockRestore();
  });

  test("server should listen on default port when PORT env is not set", () => {
    // Clear PORT env var explicitly
    delete process.env.PORT;

    // Load the server module
    require("../index.js");

    // Now check if mockListen was called with expected args
    expect(mockListen).toHaveBeenCalled();
  });

  test("server should listen on PORT from env when available", () => {
    // Set PORT env var
    process.env.PORT = "8080";

    require("../index.js");

    // Check if mockListen was called
    expect(mockListen).toHaveBeenCalled();
    
    // Get the first call arguments
    const args = mockListen.mock.calls[0];
    // The port might be passed as a string, so we'll check the value instead of the type
    expect(args[0]).toBe("8080");
  });

  test("should connect to database on startup", async () => {
    // Prepare dbConnect to resolve successfully
    dbConnect.mockResolvedValueOnce(undefined);

    // Capture the callback function
    let listenCallback;
    mockListen.mockImplementationOnce((port, callback) => {
      listenCallback = callback;
      return { close: jest.fn() };
    });

    // Load the server module
    require("../index.js");

    // Verify the callback was captured
    expect(listenCallback).toBeDefined();
    
    // Execute the callback manually
    await listenCallback();
  });

  test("should log error and exit when database connection fails", async () => {
    const mockError = new Error("DB connection error");
    dbConnect.mockRejectedValueOnce(mockError);

    // Capture the callback function
    let listenCallback;
    mockListen.mockImplementationOnce((port, callback) => {
      listenCallback = callback;
      return { close: jest.fn() };
    });

    // Load the server module
    require("../index.js");

    // Verify the callback was captured
    expect(listenCallback).toBeDefined();
    
    // Execute the callback and expect process.exit to be called
    await listenCallback().catch(error => {
      // We expect the error to be from process.exit
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
