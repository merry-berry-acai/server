const { ApiError } = require('../utils/errorHandler');

/**
 * Validates required fields in the request body
 * @param {Array} requiredFields - Array of field names that are required
 */
const validateRequiredFields = (requiredFields) => (req, res, next) => {
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    throw new ApiError(
      400, 
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }
  
  next();
};

/**
 * Validates Firebase UID parameter
 */
const validateUid = (req, res, next) => {
  const { uid } = req.params;
  
  if (!uid) {
    throw new ApiError(400, 'User ID (uid) is required');
  }
  
  if (typeof uid !== 'string' || uid.trim() === '') {
    throw new ApiError(400, 'User ID (uid) must be a non-empty string');
  }
  
  next();
};

module.exports = {
  validateRequiredFields,
  validateUid
};
