const chalk = require("chalk");

/**
 * Logger utility for consistent, colorful console logging
 */
class Logger {
  static isDebugEnabled =
    process.env.NODE_ENV === "development" || process.env.DEBUG === "true";

  /**
   * Format the current timestamp
   * @returns {string} Formatted timestamp
   */
  static getTimestamp() {
    return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
  }

  /**
   * Log an informational message
   * @param {string} message Message to log
   * @param {Object} contextData Additional context data
   */
  static info(message, contextData = {}) {
    const contextStr = this._formatContext(contextData);
    console.log(
      chalk.blue(`[INFO] ${this.getTimestamp()}: `) + message + contextStr
    );
  }

  /**
   * Log a success message
   * @param {string} message Message to log
   * @param {Object} contextData Additional context data
   */
  static success(message, contextData = {}) {
    const contextStr = this._formatContext(contextData);
    console.log(
      chalk.green(`[SUCCESS] ${this.getTimestamp()}: `) + message + contextStr
    );
  }

  /**
   * Log an error message
   * @param {string} message Message to log
   * @param {Error|null} error Error object
   * @param {Object} contextData Additional context data
   */
  static error(message, error = null, contextData = {}) {
    const contextStr = this._formatContext(contextData);
    let logMessage =
      chalk.red(`[ERROR] ${this.getTimestamp()}: `) + message + contextStr;

    if (error) {
      logMessage += `\n${chalk.red("Error details:")} ${error.message}`;
      if (error.stack && this.isDebugEnabled) {
        logMessage += `\n${chalk.dim(error.stack)}`;
      }
    }

    console.error(logMessage);
  }

  /**
   * Log a warning message
   * @param {string} message Message to log
   * @param {Object} contextData Additional context data
   */
  static warn(message, contextData = {}) {
    const contextStr = this._formatContext(contextData);
    console.log(
      chalk.yellow(`[WARN] ${this.getTimestamp()}: `) + message + contextStr
    );
  }

  /**
   * Log debug information (only in development)
   * @param {string} message Message to log
   * @param {Object} data Optional data to log
   */
  static debug(message, data = null) {
    if (!this.isDebugEnabled) return;

    let logMessage = chalk.cyan(`[DEBUG] ${this.getTimestamp()}: `) + message;

    if (data) {
      try {
        logMessage += `\n${chalk.dim(JSON.stringify(data, null, 2))}`;
      } catch (e) {
        logMessage += `\n${chalk.dim("[Data could not be stringified]")}`;
      }
    }

    console.log(logMessage);
  }

  /**
   * Log a HTTP request
   * @param {string} method HTTP method
   * @param {string} path Request path
   * @param {number} status HTTP status code
   * @param {string} userId User identifier if available
   * @param {number} responseTime Response time in ms
   */
  static request(method, path, status, userId = null, responseTime = null) {
    const statusColor =
      status >= 500
        ? chalk.red
        : status >= 400
        ? chalk.yellow
        : status >= 300
        ? chalk.cyan
        : status >= 200
        ? chalk.green
        : chalk.white;

    let logMessage =
      chalk.dim(`[${this.getTimestamp()}] `) +
      chalk.magenta(`${method} `) +
      path +
      " " +
      statusColor(`${status}`);

    // Add user ID if available
    if (userId) {
      logMessage += chalk.dim(` - User: ${userId}`);
    }

    // Add response time if available
    if (responseTime !== null) {
      const timeColor =
        responseTime > 1000
          ? chalk.red
          : responseTime > 500
          ? chalk.yellow
          : chalk.green;
      logMessage += " " + timeColor(`${responseTime}ms`);
    }

    console.log(logMessage);
  }

  /**
   * Format context data for logging
   * @private
   */
  static _formatContext(contextData) {
    if (!contextData || Object.keys(contextData).length === 0) return "";

    try {
      const contextEntries = Object.entries(contextData)
        .map(
          ([key, value]) =>
            `${key}=${
              typeof value === "object" ? JSON.stringify(value) : value
            }`
        )
        .join(", ");

      return chalk.dim(` [${contextEntries}]`);
    } catch (e) {
      return chalk.dim(" [Context data error]");
    }
  }
}

module.exports = Logger;
