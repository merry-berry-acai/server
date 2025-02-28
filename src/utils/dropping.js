// Drop values into the database

const { dbDrop, dbConnect, dbDisconnect } = require("./database");
const Logger = require("./logger");

async function drop() {
    await dbDrop();
    await dbDisconnect();
    Logger.info("Disconnected");
}

dbConnect().then(() => {
    Logger.info("Connected to the database. Dropping now....");
    drop();
})