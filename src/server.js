const express = require("express");
const ItemRoutes = require("./routes/ItemRoutes");
const PromoCodeRoutes = require("./routes/PromoCodeRoutes");

const app = express();

app.use(express.json());
app.use("/items", ItemRoutes);
app.use("/promo", PromoCodeRoutes);


module.exports = {
    app
}