
/**
 * Helper for sending consistent success responses
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    sendSuccess
};