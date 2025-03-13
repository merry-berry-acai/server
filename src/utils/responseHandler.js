const Logger = require('./logger');

/**
 * Helper for sending consistent success responses
 * @param {Object} res Express response object
 * @param {*} data Response data
 * @param {string} message Success message
 * @param {number} statusCode HTTP status code
 * @returns {Object} Express response
 */
const sendSuccess = (
  res,
  data = null,
  message = "Operation successful",
  statusCode = 200
) => {
  const response = {
    status: "success",
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  
  Logger.debug(`Sending success response [${statusCode}]: ${message}`, {
    statusCode,
    hasData: data !== null
  });
  
  return res.status(statusCode).json(response);
};

/**
 * Helper for sending consistent error responses
 * @param {Object} res Express response object
 * @param {string} message Error message
 * @param {number} statusCode HTTP status code
 * @param {*} errors Additional error details
 * @param {string} errorCode Application-specific error code
 * @returns {Object} Express response
 */
const sendError = (
  res,
  message = "An error occurred",
  statusCode = 500,
  errors = null,
  errorCode = null
) => {
  // Build the error response object
  const response = {
    status: "error",
    message,
    timestamp: new Date().toISOString(),
  };
  
  // Add error code if provided
  if (errorCode) {
    response.errorCode = errorCode;
  }

  // Add detailed errors if provided
  if (errors) {
    response.errors = errors;
  }
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development' && errors && errors.stack) {
    response.stack = errors.stack;
  }
  
  // Log the error
  Logger.error(`Sending error response [${statusCode}]: ${message}`, null, {
    statusCode,
    errorCode,
    hasErrors: errors !== null
  });
  
  return res.status(statusCode).json(response);
};

/**
 * Helper for sending validation error responses
 * @param {Object} res Express response object
 * @param {Array|Object} validationErrors Validation errors
 * @returns {Object} Express response
 */
const sendValidationError = (res, validationErrors) => {
  const errorMessage = "Validation failed";
  const formattedErrors = Array.isArray(validationErrors) 
    ? validationErrors 
    : [{ message: validationErrors.toString() }];
    
  Logger.warn(`Validation error: ${errorMessage}`, { 
    errorCount: formattedErrors.length 
  });
  
  return sendError(res, errorMessage, 422, formattedErrors, 'VALIDATION_ERROR');
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError
};
