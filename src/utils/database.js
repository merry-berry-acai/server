require('dotenv').config();
const mongoose = require("mongoose");
const logger = require('./logger');

// function to connect to the database
async function dbConnect() {
    let databaseUrl = process.env.MONGODB_URI || `mongodb://localhost:27017/merry-berry`;
    try {
        await mongoose.connect(databaseUrl);
        logger.success(`Database connected to ${databaseUrl}`);
    }
    catch(err) {
        logger.error(`Cannot connect to the database: ${err.message}`);
        throw err; // Re-throw to allow handling by the caller
    }
}

async function dbDisconnect() {
    try {
        await mongoose.connection.close();
        logger.info('Database disconnected');
    } catch (err) {
        logger.error(`Error disconnecting from database: ${err.message}`);
        throw err;
    }
}

async function dbDrop() {
    try {
        await mongoose.connection.db.dropDatabase();
        logger.warn(`Database ${mongoose.connection.db.databaseName} dropped`);
    } catch (err) {
        logger.error(`Error dropping database: ${err.message}`);
        throw err;
    }
}

module.exports = {
    dbConnect, dbDisconnect, dbDrop
}