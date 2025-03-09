const express = require("express");
const app = express();
const requestLogger = require("./middlewares/requestLogger");
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://sentry.io/api/projects/your-project-id/minidump/?sentry_key=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", // Replace with your actual DSN
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express(),
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  // Set environment, you can read this from process.env.NODE_ENV if you want
  environment: "production", 
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.request());
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
app.use("/images", require("./routes/ImageRoutes")); // Add the images route

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});


module.exports = { app };
