// Drop values into the database

const { dbDrop, dbConnect, dbDisconnect } = require("./database");

async function drop() {
    await dbDrop();
    await dbDisconnect();
    console.log("Disconnected");
}

dbConnect().then(() => {
    console.log("Connected to the database. Dropping now....");
    drop();
})