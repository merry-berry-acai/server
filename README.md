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
- [Shopping Cart Management](#shopping-cart-management)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Orders](#orders)
  - [Menu Items](#menu-items)
  - [Promo Codes](#promo-codes)
- [Contributing](#contributing)
- [License](#license)

## Overview
This repository powers the backend for the **Merry Berry Smoothie & Açaí Shop**. The API provides endpoints to handle:
- User registration, login, and management
- Menu items and their details
- Orders and their statuses
- Promo codes for discounts

The frontend manages the shopping cart, and it sends the cart details to the backend when an order is placed.

## Models

### User Model
Stores user information.

#### Fields:
- `username`: String (required, unique)
- `email`: String (required, unique)
- `passwordHash`: String (hashed password)
- `isAdmin`: Boolean (indicates admin privileges)

### Order Model
Stores order details when a user places an order.

#### Fields:
- `userId`: Reference to User
- `items`: Array of subdocuments containing:
  - `menuItemId`: Reference to MenuItem
  - `size`: String ("Small", "Medium", "Large")
  - `toppings`: Array of Strings (predefined options)
  - `addIns`: Array of Strings (predefined options)
  - `quantity`: Number (default: 1)
- `totalPrice`: Number (calculated based on item prices and quantity)
- `status`: String (e.g., "Pending", "Completed")
- `createdAt`: Timestamp

### MenuItem Model
Stores available menu items.

#### Fields:
- `name`: String (required, unique)
- `description`: String
- `price`: Number (required)
- `sizeOptions`: Array of Strings (available sizes)
- `toppingsOptions`: Array of Strings (available toppings)
- `addInsOptions`: Array of Strings (available add-ins)

### PromoCode Model
Stores discount codes for orders.

#### Fields:
- `code`: String (unique, required)
- `discountPercentage`: Number (0-100)
- `expirationDate`: Date

## Shopping Cart Management
The shopping cart is managed on the frontend and is not stored in the database. When a user places an order, the frontend sends the cart details to the backend, which then stores them in the Order model.

## API Endpoints
