/**
 * Configuration settings for application logging
 */
const loggerConfig = {
  /**
   * Control which levels of logs are displayed in different environments
   */
  logLevels: {
    development: ["debug", "info", "warn", "error", "success"],
    test: ["info", "warn", "error"],
    production: ["info", "warn", "error"],
  },

  /**
   * Fields that should be redacted from logs to protect sensitive information
   */
  sensitiveFields: [
    "password",
    "passwordConfirmation",
    "token",
    "apiKey",
    "secret",
    "credit_card",
    "creditCard",
    "ssn",
    "socialSecurityNumber",
  ],

  /**
   * Maximum length for logged response bodies
   */
  maxResponseLogLength: 1024,

  /**
   * Whether to log database queries (in development only)
   */
  logDatabaseQueries: process.env.NODE_ENV === "development",

  /**
   * Whether to log detailed timing information
   */
  logPerformance: process.env.NODE_ENV !== "production",
};

module.exports = loggerConfig;
