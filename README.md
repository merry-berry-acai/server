# Merry Berry Smoothie & Açaí Shop - Backend

![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-blue)
![Git](https://img.shields.io/badge/Git-v2.30%2B-lightgrey)
![Express](https://img.shields.io/badge/Express-v4%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

This repository contains the backend implementation for the **Merry Berry Smoothie & Açaí Shop**. It provides API endpoints to manage users, menu items, promo codes, and orders. The shopping cart is managed on the frontend and is not stored in the database.

## Table of Contents
- [Overview](#overview)
- [Models](#models)
  - [User Model](#user-model)
  - [Order Model](#order-model)
  - [MenuItem Model](#menuitem-model)
  - [PromoCode Model](#promocode-model)
  - [Review Model](#review-model)
  - [Topping Model](#topping-model)
- [Shopping Cart Management](#shopping-cart-management)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Orders](#orders)
  - [Menu Items](#menu-items)
  - [Promo Codes](#promo-codes)
- [Contributing](#contributing)


## Overview
This repository powers the backend for the **Merry Berry Smoothie & Açaí Shop**. The API provides endpoints to handle:
- User registration, login, and management
- Menu items and their details
- Orders and their statuses
- Promo codes for discounts
- Reviews and ratings for menu items
- Toppings for customization

The frontend manages the shopping cart, and it sends the cart details to the backend when an order is placed.

## Models

### User Model
Stores user information.

- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (hashed password, required)
- `orderHistory`: Array of references to `Order`
- `userRole`: Enum (`customer`, `shop owner`)

### Order Model
Stores order details when a user places an order.

- `user`: Reference to `User`
- `items`: Array of subdocuments containing:
  - `product`: Reference to `MenuItem`
  - `quantity`: Number (default: 1)
- `totalPrice`: Number (calculated based on item prices and quantity)
- `orderStatus`: Array of Strings (e.g., `["Pending", "Processing", "Shipped", "Delivered"]`)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### MenuItem Model
Stores available menu items.

- `name`: String (required, unique)
- `description`: String
- `imageUrl`: String
- `basePrice`: Number (required)
- `category`: Enum (`smoothie`, `akai`, `juice`)
- `availability`: Boolean (default: true)

### PromoCode Model
Stores discount codes for orders.

- `code`: String (unique, required)
- `discount`: Number (required)
- `discountType`: Enum (`percentage`, `fixed`)
- `startDate`: Date (required)
- `endDate`: Date (required)
- `minOrderAmount`: Number (default: 0)
- `applicableProducts`: Array of references to `MenuItem`

### Review Model
Stores user reviews and ratings for menu items.

- `userId`: Reference to `User`
- `itemId`: Reference to `MenuItem`
- `rating`: Number (min: 1, max: 5)
- `comment`: String
- `createdAt`: Timestamp

### Topping Model
Stores available toppings for customization.

- `name`: String (required)
- `price`: Number (default: 0)
- `availability`: Boolean (default: true)

## Shopping Cart Management
The shopping cart is managed on the frontend and is not stored in the database. When a user places an order, the frontend sends the cart details to the backend, which then stores them in the `Order` model.

## API Endpoints


## MongoDB Connection Setup

To connect the backend application to a MongoDB database, follow these steps:

**1. MongoDB Installation or Cloud Service:**

*   **Option A: Local MongoDB Installation (for development):**
    *   If you don't have MongoDB installed locally, you'll need to download and install it.  Follow the official MongoDB installation guide for your operating system: [https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)
    *   After installation, ensure the MongoDB server ( `mongod` process) is running. You can typically start it by running `mongod` in your terminal.

*   **Option B: Cloud MongoDB Service (e.g., MongoDB Atlas):**
    *   For production or a more managed setup, consider using a cloud MongoDB service like MongoDB Atlas ([https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)).
    *   Sign up for a free MongoDB Atlas account and create a new cluster.
    *   Once your cluster is created, you'll get a **connection string**. You will need this connection string in the next step.

**2. Configure Environment Variables:**

The backend application uses environment variables to securely store the MongoDB connection details. You need to create a `.env` file in your backend root directory (if you don't have one already) and define the following environment variable:

```
MONGODB_URI=your_mongodb_connection_string_here
```

*   **`MONGODB_URI`**:  This variable holds the connection string to your MongoDB database.

    *   **For Local MongoDB:** If you are using a local MongoDB instance with default settings, the connection string might look like this: `mongodb://localhost:27017/merryberry_db` (where `merryberry_db` is the name of your database - you can choose a different name).
    *   **For MongoDB Atlas (or other cloud services):**  Replace `your_mongodb_connection_string_here` with the actual connection string provided by your cloud MongoDB service (e.g., from MongoDB Atlas).  **Ensure you replace placeholders like `<username>`, `<password>`, and `<cluster-url>` in the connection string with your actual credentials.**

**Example `.env` file:**

```
MONGODB_URI=mongodb://localhost:27017/merryberry_db
# Or for MongoDB Atlas (replace with your actual connection string):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/merryberry_db?retryWrites=true&w=majority
```

**Important Security Note:**

*   **Never commit your `.env` file (especially with cloud database credentials) to your Git repository.**  Ensure `.env` is listed in your `.gitignore` file to prevent accidental exposure of sensitive information.
*   For production deployments, use secure environment variable management practices provided by your hosting platform instead of relying on `.env` files directly within the deployed application.

**3. Backend Application Code (using Mongoose):**

In your backend code (likely in your main server file, e.g., `server.js` or `app.js`), you will use Mongoose to connect to MongoDB using the `MONGODB_URI` environment variable.  Here's a typical example in Node.js with Mongoose:

```javascript
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// ... rest of your backend application code ...
```

**Explanation:**

*   **`require('dotenv').config();`**:  This line (using the `dotenv` package) loads environment variables from your `.env` file into `process.env`.
*   **`process.env.MONGODB_URI`**:  Accesses the MongoDB connection string from the environment variables.
*   **`mongoose.connect(...)`**:  Establishes a connection to MongoDB using the provided URI and connection options.
*   **Error Handling:**  The `try...catch` block handles potential connection errors and logs a message to the console.

**4. Verify Connection:**

After setting up the environment variable and running your backend application, check the console output. You should see the `console.log('MongoDB connected successfully!')` message if the connection is established correctly.  If there are errors, review your connection string, MongoDB server status, and network connectivity.

By following these steps, you will successfully configure your backend application to connect to a MongoDB database, enabling data persistence for your Merry Berry Smoothie & Açaí Shop application.