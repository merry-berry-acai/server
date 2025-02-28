require('dotenv').config();
const logger = require('./utils/logger');
const { app } = require("./server.js");
const { dbConnect } = require('./utils/database.js');

// Get the port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = app.listen(PORT, async () => {
    logger.info(`Server is listening on port ${PORT}`);
    
    try {
        // Connect to the database
        await dbConnect();
        logger.success('Database connection established');
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});