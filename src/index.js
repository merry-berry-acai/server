require("dotenv").config();
const Logger = require("./utils/logger");
const { app } = require("./server.js");
const { dbConnect } = require("./utils/database.js");

// Get the port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = app.listen(PORT, async () => {
    Logger.info(`Server is listening on port ${PORT}`, {
        env: process.env.NODE_ENV || "development",
        port: PORT,
    });

    try {
        // Connect to the database
        await dbConnect();
        Logger.success("Database connection established");
    } catch (error) {
        Logger.error(`Database connection failed`, error, {
            service: "database",
        });
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    Logger.error(`Unhandled Rejection`, err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    Logger.error(`Uncaught Exception`, err);
    // Close server & exit process
    server.close(() => process.exit(1));
});
