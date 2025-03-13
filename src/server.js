const express = require("express");
const app = express();
const requestLogger = require("./middlewares/requestLogger");
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: "https://2be293c706cb92cbb9e6484727c4b2a9@o4508947030867968.ingest.de.sentry.io/4508948514406480",
});

console.log("Sentry initialized.");

Sentry.setupExpressErrorHandler(app);

app.use(express.json());
app.use(requestLogger);

app.use(
    cors({
        origin: "*", // Allow all origins;
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);


app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});

// Routes
app.use("/items", require("./routes/ItemRoutes"));
app.use("/orders", require("./routes/OrderRoutes"));
app.use("/users", require("./routes/UserRoutes"));
app.use("/toppings", require("./routes/ToppingRoutes"));
app.use("/categories", require("./routes/CategoryRoutes"));
app.use("/checkout", require("./routes/Payment"));
app.use("/images", require("./routes/ImageRoutes"));

app.use(errorHandler);

// Handle 404 - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        status: "error",
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});


module.exports = { app };
