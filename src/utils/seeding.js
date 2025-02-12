const { dbConnect, dbDisconnect } = require("./database");
const { createMenuItem } = require("../controllers/menuItemController");
const { createOrder } = require("../controllers/orderController");
const { createReview } = require("../controllers/reviewController");
const { createTopping } = require("../controllers/toppingController");
const { createUser } = require("../controllers/userController");
const { createPromoCode } = require("../controllers/promoCodeController");

// Sample Users
const users = [
    { name: "Danilo", email: "danilo@example.com", password: "password123", userRole: "customer" },
    { name: "Ethan", email: "ethan@example.com", password: "password123", userRole: "customer" },
    { name: "Joel", email: "joel@example.com", password: "password123", userRole: "customer" },
    { name: "Peter", email: "peter@example.com", password: "password123", userRole: "shop owner" },
];

// Sample Menu Items
const menuItems = [
    { name: "Strawberry Smoothie", description: "A refreshing blend of strawberries and yogurt", basePrice: 5.99, category: "smoothie" },
    { name: "Blueberry Acai Bowl", description: "A nutrient-packed bowl with acai, granola, and fruits", basePrice: 8.49, category: "akai" },
    { name: "Mango Juice", description: "Freshly squeezed mango juice with a hint of lime", basePrice: 4.99, category: "juice" },
    { name: "Tropical Smoothie", description: "A mix of pineapple, coconut, and banana", basePrice: 6.99, category: "smoothie" },
    { name: "Acai Energy Boost", description: "Acai bowl with honey, banana, and nuts", basePrice: 7.99, category: "akai" },
];

// Sample Toppings
const toppings = [
    { name: "Chia Seeds", price: 1.00, availability: true },
    { name: "Almond Butter", price: 1.50, availability: true },
    { name: "Coconut Flakes", price: 0.75, availability: true },
    { name: "Honey Drizzle", price: 1.25, availability: true },
];

// Sample Promo Codes
const promoCodes = [
    { code: "WELCOME10", discount: 10, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 30)), minOrderAmount: 10 },
    { code: "SUMMER20", discount: 20, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 14)), minOrderAmount: 15 },
    { code: "FRESH5", discount: 5, startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 60)), minOrderAmount: 5 },
];

// Function to seed the database
async function seedDatabase() {
    try {
        await dbConnect();
        console.log("Database Connected...");

        console.log("Seeding Users...");
        const seededUsers = [];
        for (const user of users) {
            const createdUser = await createUser(user.name, user.email, user.password, user.userRole);
            seededUsers.push(createdUser);
            console.log(`User Created: ${user.name}`);
        }

        console.log("Seeding Menu Items...");
        const seededItems = [];
        for (const item of menuItems) {
            const createdItem = await createMenuItem(item.name, item.description, item.basePrice, item.category);
            seededItems.push(createdItem);
            console.log(`Menu Item Created: ${item.name}`);
        }

        console.log("Seeding Toppings...");
        const seededToppings = [];
        for (const topping of toppings) {
            const createdTopping = await createTopping(topping.name, topping.price, topping.availability);
            seededToppings.push(createdTopping);
            console.log(`Topping Created: ${topping.name}`);
        }

        console.log("Seeding Promo Codes...");
        const seededPromos = [];
        for (const promo of promoCodes) {
            const createdPromo = await createPromoCode(promo.code, promo.discount, promo.startDate, promo.endDate, promo.minOrderAmount);
            seededPromos.push(createdPromo);
            console.log(`Promo Code Created: ${promo.code}`);
        }

        console.log("Seeding Orders...");
        for (const user of seededUsers) {
            const order = await createOrder(user._id, [
                { product: seededItems[0]._id, quantity: 2 },
                { product: seededItems[1]._id, quantity: 1 },
            ], 20.97, "No sugar added");
            console.log(`Order Created for User: ${user.name}`);
        }

        console.log("Seeding Reviews...");
        for (const user of seededUsers) {
            const review = await createReview(user._id, seededItems[0]._id, 5, "Amazing taste and freshness!");
            console.log(`Review Added by User: ${user.name}`);
        }

        console.log("Seeding Completed Successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await dbDisconnect();
        console.log("Database Disconnected.");
    }
}

// Run the seed function
seedDatabase();
