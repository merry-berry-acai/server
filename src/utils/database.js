require('dotenv').config();

const mongoose = require("mongoose");

// function to connect to the database
async function dbConnect() {
    let databaseUrl = process.env.MONGODB_URI || `mongodb+srv://dbuser:dbuser@merry-berry.o0ylg.mongodb.net/?retryWrites=true&w=majority&appName=merry-berry`;
    try {
        console.log(databaseUrl);
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