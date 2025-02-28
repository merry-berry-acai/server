/**
 * Middleware for logging all incoming HTTP requests
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} request to ${req.originalUrl} from ${req.ip}`);
  
  // Only log the body for non-GET requests to avoid cluttering the logs
  if (req.method !== 'GET') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  next(); // Continue to the next middleware or route handler
};

module.exports = requestLogger;
