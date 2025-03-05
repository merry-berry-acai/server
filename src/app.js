const express = require("express");
const path = require("path");
// ...other imports...

const app = express();

// ...middleware...

// Serve static files from public directory at root URL
// This makes /public/images/file.jpeg accessible at /images/file.jpeg
app.use(express.static(path.join(__dirname, "../public")));

// Don't mount the image routes at /images as it will conflict with static files
// Instead, use a different path for API operations on images
app.use("/api/images", require("./routes/ImageRoutes"));

// ...other routes...

// Export the app
module.exports = app;
