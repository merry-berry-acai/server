const express = require("express");
const cors = require("cors");
const requestLogger = require("./middlewares/requestLogger");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const {
  checkUserFirebaseUid,
  checkUserId,
} = require("./middlewares/checkUser");
const Logger = require("./utils/logger");

const app = express();

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Authentication middleware
app.use(checkUserFirebaseUid);
app.use(checkUserId);

// Basic health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Application routes
app.use("/items", require("./routes/ItemRoutes"));
app.use("/orders", require("./routes/OrderRoutes"));
app.use("/users", require("./routes/UserRoutes"));
app.use("/toppings", require("./routes/ToppingRoutes"));
app.use("/categories", require("./routes/CategoryRoutes"));
app.use("/checkout", require("./routes/Payment"));
app.use("/images", require("./routes/ImageRoutes"));

// Error handling middleware
app.use(errorHandler);

// Handle 404 - Route not found
app.use(notFoundHandler);

module.exports = { app };
