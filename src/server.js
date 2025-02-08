const express = require("express");
const app = express();
const ItemRoutes = require("./routes/ItemRoutes");

//middlewares
app.use(express.json());
app.use("/items",ItemRoutes);

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