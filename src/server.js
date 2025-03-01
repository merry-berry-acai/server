const express = require("express");
const app = express();
const requestLogger = require("./middlewares/requestLogger");
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");

app.use(express.json());
app.use(requestLogger);

app.use(
  cors({
    origin: "*", // Allow all origins; adjust as needed for production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);


app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Routes
app.use("/items", require("./routes/ItemRoutes"));
app.use("/orders", require("./routes/OrderRoutes"));
app.use("/reviews", require("./routes/ReviewRoutes"));
app.use("/users", require("./routes/UserRoutes"));
app.use("/toppings", require("./routes/ToppingRoutes"));
app.use("/categories", require("./routes/CategoryRoutes"));
app.use("/checkout", require("./routes/Payment"));

app.use(errorHandler);

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});


module.exports = { app };
