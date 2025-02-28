const logger = require('../utils/logger');
const chalk = require('chalk'); // You'll need to install this: npm install chalk@4.1.2 (using v4 for CommonJS)

// Define colors for different HTTP methods
const methodColors = {
  GET: chalk.green,
  POST: chalk.yellow,
  PUT: chalk.blue,
  PATCH: chalk.cyan,
  DELETE: chalk.red,
  OPTIONS: chalk.gray,
  HEAD: chalk.gray
};

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when request is complete
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.request(
      req.method,
      req.originalUrl,
      res.statusCode
    );
    
    // Log slow requests (> 1000ms) as warnings
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

module.exports = requestLogger;
