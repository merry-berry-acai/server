const express = require("express");
const cors = require("cors");

// Import route files
const ItemRoutes = require("./routes/ItemRoutes");
const PromoCodeRoutes = require("./routes/PromoCodeRoutes");
const OrderRoutes = require("./routes/OrderRoutes");
const ReviewRoutes = require("./routes/ReviewRoutes");
const UserRoutes = require("./routes/UserRoutes");
const ToppingRoutes = require("./routes/ToppingRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend integration

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});


// Routes
app.use("/items", ItemRoutes);
app.use("/promo", PromoCodeRoutes);
app.use("/orders", OrderRoutes);
app.use("/reviews", ReviewRoutes);
app.use("/users", UserRoutes);
app.use("/toppings", ToppingRoutes);

app.use(cors({
    origin: "*", // Allow all origins; adjust as needed for production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }));

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});


module.exports = { app };
