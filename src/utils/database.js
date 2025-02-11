require('dotenv').config();

const mongoose = require("mongoose");

// function to connect to the database
async function dbConnect() {
    let databaseUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/merryberrydb';
    try {
        await mongoose.connect(databaseUrl);
        console.log("Database connected");
    }
    catch(err) {
        console.error("Cannot connect to the database", err);
    }

}

async function dbDisconnect() {
    // await mongoose.disconnect();
    await mongoose.connection.close();
}

async function dbDrop() {
    await mongoose.connection.db.dropDatabase();
}

module.exports = {
    dbConnect, dbDisconnect, dbDrop
}