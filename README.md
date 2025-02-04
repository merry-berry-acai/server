# Merry Berry Smoothie & Açaí Shop - Backend

## Overview
This repository contains the backend implementation for the Merry Berry Smoothie & Açaí Shop. It provides API endpoints to manage users, menu items, promo codes, and orders. The shopping cart is managed on the frontend and is not stored in the database.

## Models

### 1. User Model
- Stores user information.
- Fields:
  - `username`: String (required, unique)
  - `email`: String (required, unique)
  - `passwordHash`: String (hashed password)
  - `isAdmin`: Boolean (indicates admin privileges)

### 2. Order Model
- Stores order details when a user places an order.
- Fields:
  - `userId`: Reference to `User`
  - `items`: Array of subdocuments containing:
    - `menuItemId`: Reference to `MenuItem`
    - `size`: String ("Small", "Medium", "Large")
    - `toppings`: Array of Strings (predefined options)
    - `addIns`: Array of Strings (predefined options)
    - `quantity`: Number (default: 1)
  - `totalPrice`: Number (calculated based on item prices and quantity)
  - `status`: String (e.g., "Pending", "Completed")
  - `createdAt`: Timestamp

### 3. MenuItem Model
- Stores available menu items.
- Fields:
  - `name`: String (required, unique)
  - `description`: String
  - `price`: Number (required)
  - `sizeOptions`: Array of Strings (available sizes)
  - `toppingsOptions`: Array of Strings (available toppings)
  - `addInsOptions`: Array of Strings (available add-ins)

### 4. PromoCode Model
- Stores discount codes for orders.
- Fields:
  - `code`: String (unique, required)
  - `discountPercentage`: Number (0-100)
  - `expirationDate`: Date

## Shopping Cart Management
The **shopping cart is managed on the frontend** and is not stored in the database. When a user places an order, the frontend sends the cart details to the backend, which then stores them in the `Order` model.

## API Endpoints
- **Users**: Register, login, and manage user accounts.
- **Orders**: Place and track orders.
- **Menu Items**: Retrieve available menu items.
- **Promo Codes**: Apply discounts to orders.
