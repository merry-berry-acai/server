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
