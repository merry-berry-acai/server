# Merry Berry Smoothie & Açaí Shop - Backend Models

This repository contains the backend models for the **Merry Berry Smoothie & Açaí Shop** online ordering system. The models are designed to manage users, menu items, shopping carts, orders, and promo codes using MongoDB and Mongoose. Below is a detailed explanation of the models and how they are structured.

---

## Models Overview

1. **User**
2. **MenuItem**
3. **Order**
4. **PromoCode**
5. **ShoppingCart**

---

## Model Breakdown

### **User Model**

The `User` model represents a user in the system. It includes basic information such as `username`, `email`, `passwordHash`, and an `isAdmin` field to differentiate between normal users and admin users.

- **Fields:**
  - `username`: The user's chosen username.
  - `email`: The user's unique email address.
  - `passwordHash`: The hashed password for the user.
  - `isAdmin`: Boolean flag to mark whether the user is an admin (defaults to `false`).

---

### **MenuItem Model**

The `MenuItem` model represents the items available in the menu. Each item includes attributes like `name`, `description`, `price`, `category`, and an optional `imageUrl`.

- **Fields:**
  - `name`: The name of the menu item.
  - `description`: A short description of the item.
  - `price`: The price of the item.
  - `imageUrl`: Optional URL to an image of the item.
  - `category`: The category of the item (either "Smoothie" or "Açaí Bowl").

---

### **Order Model**

The `Order` model represents an order placed by a user. It includes an array of `items` that contain references to the `MenuItem` model, as well as `size`, `toppings`, `addIns`, `quantity`, and other relevant details.

- **Fields:**
  - `userId`: The reference to the user who placed the order.
  - `items`: An array of items in the order, each containing details like `menuItemId`, `size`, `toppings`, `addIns`, and `quantity`.
  - `totalAmount`: The total cost of the order.
  - `status`: The current status of the order (e.g., Pending, Preparing).
  - `deliveryAddress`: The address where the order will be delivered.
  - `deliveryTime`: The expected time for delivery.

---

### **PromoCode Model**

The `PromoCode` model represents promotional codes that can be applied to orders to get discounts. It includes `code`, `discountAmount`, `expirationDate`, and a flag `isActive` to indicate if the promo code is currently active.

- **Fields:**
  - `code`: The unique promo code.
  - `discountAmount`: The discount value (e.g., $5 or 10%).
  - `expirationDate`: The date until which the promo code is valid.
  - `isActive`: Boolean flag to indicate whether the promo code is still active.

---

### 5️⃣ **ShoppingCart Model**

The `ShoppingCart` model represents the shopping cart of a user. It includes an array of `items` that contain details about the selected menu items, as well as the total amount and a reference to the user.

- **Fields:**
  - `userId`: The reference to the user who owns the shopping cart.
  - `items`: An array of items in the cart, each containing `menuItemId`, `size`, `toppings`, `addIns`, and `quantity`.
  - `totalAmount`: The total cost of the items in the cart.

---

## References

- **User Model:** The `Order`, `ShoppingCart`, and `PromoCode` models reference the `User` model through the `userId` field. This allows us to associate orders, carts, and promo codes with a specific user.
- **MenuItem Model:** The `Order` and `ShoppingCart` models reference the `MenuItem` model through the `menuItemId` field to link each item in an order or cart to a specific menu item.
- **ShoppingCart Model:** The `ShoppingCart` model holds a reference to the `User` model, which allows each user to have a unique shopping cart.
- **PromoCode Model:** The `PromoCode` model can be applied to `Order` models to provide a discount, helping to manage promotional discounts and their expiration dates.

---