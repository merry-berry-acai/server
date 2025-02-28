const chalk = require('chalk');

/**
 * Logger utility for consistent, colorful console logging
 */
class Logger {
    /**
     * Format the current timestamp
     * @returns {string} Formatted timestamp
     */
    static getTimestamp() {
        return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }
    
    /**
     * Log an informational message
     * @param {string} message Message to log
     */
    static info(message) {
        console.log(
            chalk.blue(`[INFO] ${this.getTimestamp()}: `) + message
        );
    }
    
    /**
     * Log a success message
     * @param {string} message Message to log
     */
    static success(message) {
        console.log(
            chalk.green(`[SUCCESS] ${this.getTimestamp()}: `) + message
        );
    }
    
    /**
     * Log an error message
     * @param {string} message Message to log
     */
    static error(message) {
        console.log(
            chalk.red(`[ERROR] ${this.getTimestamp()}: `) + message
        );
    }
    
    /**
     * Log a warning message
     * @param {string} message Message to log
     */
    static warn(message) {
        console.log(
            chalk.yellow(`[WARN] ${this.getTimestamp()}: `) + message
        );
    }
    
    /**
     * Log a HTTP request
     * @param {string} method HTTP method
     * @param {string} path Request path
     * @param {number} status HTTP status code
     */
    static request(method, path, status) {
        const statusColor = status >= 500 ? chalk.red 
                          : status >= 400 ? chalk.yellow
                          : status >= 300 ? chalk.cyan
                          : status >= 200 ? chalk.green
                          : chalk.white;
        
        console.log(
            chalk.dim(`[${this.getTimestamp()}] `) +
            chalk.magenta(`${method} `) +
            path + ' ' +
            statusColor(`${status}`)
        );
    }
}

module.exports = Logger;
