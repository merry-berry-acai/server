const { ApiError } = require('../utils/errorHandler');

/**
 * Validates required fields in the request body
 * @param {Array} requiredFields - Array of field names that are required
 */
const validateRequiredFields = (requiredFields) => (req, res, next) => {
    const missingFields = requiredFields.filter(field => {
        return req.body[field] === undefined || req.body[field] === null || req.body[field] === '';
    });

    if (missingFields.length > 0) {
        throw new ApiError(
            400,
            `Missing required fields: ${missingFields.join(', ')}`
        );
    }

    next();
};


module.exports = {
    validateRequiredFields
};
