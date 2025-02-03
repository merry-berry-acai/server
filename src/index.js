require('dotenv').config();

// Server is configured in this file
const { app } = require("./server.js");
const { dbConnect } = require('./utils/database.js');


//get the port
const PORT = process.env.PORT || 5000;

// listen to the port
app.listen(PORT, async ()=> {
    console.log(`server is listening to PORT: ${PORT}`);

    // connect to the database
    await dbConnect();
})