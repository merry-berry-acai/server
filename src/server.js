const express = require("express");

//instance of the express for configuration
const app = express();

//app.verb(path, callback)
app.get("/", (req, res)=> {
    //res.send("<h1>ciao</h1>");
    res.json({
        message:"Hello World"
    })
});

module.exports = {
    app
}