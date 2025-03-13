# Merry Berry Smoothie & Açaí Shop - Backend

![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-blue)
![Express](https://img.shields.io/badge/Express-v4%2B-brightgreen)
![Jest](https://img.shields.io/badge/Jest-v29%2B-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## Deployed Application

- **Frontend**: [https://merry-berry-smoothie.netlify.app](https://merry-berry-smoothie.netlify.app)
- **Backend API**: [https://merry-berry-api.herokuapp.com](https://merry-berry-api.herokuapp.com)

## GitHub Repositories

- **Frontend**: [https://github.com/coder-academy/merry-berry-frontend](https://github.com/coder-academy/merry-berry-frontend)
- **Backend**: [https://github.com/coder-academy/merry-berry-backend](https://github.com/coder-academy/merry-berry-backend)

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Installation and Setup](#installation-and-setup)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Models](#models)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Contributors](#contributors)

## Project Overview

Merry Berry Smoothie & Açaí Shop is a full-stack application for a smoothie and açaí bowl shop. The backend provides a RESTful API that handles user authentication, menu item management, order processing, and payment integration.

This repository contains the backend implementation, built with Node.js, Express, and MongoDB. It follows a modular architecture with clear separation of concerns, implementing DRY principles and proper error handling.

## Technologies Used

### Core Technologies (MERN Stack)
- **MongoDB**: NoSQL database for storing application data
- **Express**: Web framework for building the API
- **Node.js**: JavaScript runtime environment

### Additional Libraries and Tools
- **Mongoose**: MongoDB object modeling for Node.js
- **Jest & Supertest**: Testing framework and library for HTTP assertions
- **Stripe**: Payment processing integration
- **JWT**: JSON Web Tokens for authentication
- **Multer**: Middleware for handling file uploads
- **Cors**: Cross-Origin Resource Sharing middleware
- **Dotenv**: Environment variable management

## Features

- **User Authentication**: Registration, login, and role-based access control
- **Menu Management**: CRUD operations for menu items, categories, and toppings
- **Order Processing**: Create, read, update, and track orders
- **Payment Integration**: Secure payment processing with Stripe
- **Image Handling**: Upload and serve product images
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Error Handling**: Centralized error handling middleware
- **Logging**: Request logging and error logging

## API Endpoints

### Users
- `POST /users/register`: Register a new user
- `GET /users`: Get authenticated user's profile
- `GET /users/:id`: Get user by ID (admin only)
- `GET /users/all`: Get all users (admin only)
- `PATCH /users`: Update authenticated user's profile
- `DELETE /users/:id`: Delete authenticated user's account
- `GET /users/:id/orders`: Get orders for a specific user (admin or self)
- `GET /users/orders/me`: Get authenticated user's orders

### Menu Items
- `GET /items`: Get all menu items
- `GET /items/:id`: Get menu item by ID
- `POST /items`: Create a new menu item (admin only)
- `PUT /items/:id`: Update a menu item (admin only)
- `DELETE /items/:id`: Delete a menu item (admin only)

### Categories
- `GET /categories`: Get all categories
- `GET /categories/:id`: Get category by ID
- `POST /categories`: Create a new category (admin only)
- `PUT /categories/:id`: Update a category (admin only)
- `DELETE /categories/:id`: Delete a category (admin only)

### Toppings
- `GET /toppings`: Get all toppings
- `GET /toppings/:id`: Get topping by ID
- `POST /toppings`: Create a new topping (admin only)
- `PUT /toppings/:id`: Update a topping (admin only)
- `DELETE /toppings/:id`: Delete a topping (admin only)

### Orders
- `GET /orders`: Get all orders (admin only)
- `GET /orders/:id`: Get order by ID (admin or order owner)
- `POST /orders`: Create a new order
- `PATCH /orders/:id/status`: Update order status (admin only)

### Payments
- `POST /checkout`: Process payment with Stripe

### Images
- `GET /images/:filename`: Serve image files
- `POST /api/images/upload`: Upload image files (admin only)

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/coder-academy/merry-berry-backend.git
   cd merry-berry-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/merryberry_db
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Drop the database (if needed)**
   ```bash
   npm run drop
   ```

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

## Testing

The project uses Jest as the testing framework with Supertest for API testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are organized in the `src/__tests__` directory, mirroring the structure of the source code:

- `__tests__/controllers/`: Tests for controller functions
- `__tests__/middlewares/`: Tests for middleware functions
- `__tests__/models/`: Tests for database models
- `__tests__/routes/`: Tests for API routes
- `__tests__/utils/`: Tests for utility functions

## Project Structure

```
├── docs/                  # Documentation files
│   └── kanban/            # Project management screenshots
├── public/                # Static files
│   └── images/            # Product images
├── src/                   # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # External service integrations
│   ├── utils/             # Utility functions
│   ├── __tests__/         # Test files
│   ├── index.js           # Application entry point
│   └── server.js          # Express server setup
├── .env                   # Environment variables (not in repo)
├── .gitignore             # Git ignore file
├── jest.config.js         # Jest configuration
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Models

### User Model
Stores user information.

- `uid`: String (Firebase UID, required, unique)
- `displayName`: String (required)
- `email`: String (required, unique)
- `photoURL`: String
- `favorites`: Array of references to `Product`
- `orderHistory`: Array of references to `Order`
- `role`: Enum (`user`, `admin`)

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
- `category`: Enum (`smoothie`, `acai`, `juice`)
- `availability`: Boolean (default: true)

### Category Model
Stores product categories.

- `name`: String (required, unique)
- `description`: String
- `products`: Array of references to `MenuItem`

### Topping Model
Stores available toppings for customization.

- `name`: String (required)
- `price`: Number (default: 0)
- `availability`: Boolean (default: true)

## Middleware

The application uses several middleware functions to handle common tasks:

- **requestLogger**: Logs incoming requests
- **errorHandler**: Centralized error handling
- **checkUserFirebaseUid**: Extracts and validates Firebase UID from request headers
- **checkUserId**: Attaches user data to request
- **checkAdminRole**: Restricts routes to admin users
- **checkDuplicateUser**: Prevents duplicate user registration
- **validate**: Validates request data
- **validateItemCategory**: Ensures menu item has a valid category
- **validateOrderStatus**: Validates order status updates
- **validateToppings**: Ensures toppings exist and are available

## Error Handling

The application uses a centralized error handling approach:

- **asyncHandler**: Wrapper for async route handlers to catch errors
- **errorHandler middleware**: Processes errors and sends appropriate responses
- **Custom error classes**: For specific error types
- **Logging**: All errors are logged with relevant context

## Authentication

The application uses Firebase Authentication:

- User authentication is handled by Firebase on the frontend
- The backend verifies Firebase tokens and extracts the UID
- Role-based access control is implemented for admin-only routes
- JWT tokens are used for maintaining sessions

## Contributors

- John Smith
- Jane Doe
- Bob Johnson
- Alice Williams

---

This project was developed as part of the Diploma of Information Technology at Coder Academy.
