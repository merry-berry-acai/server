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

// Sample Toppings (Optional)
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
        const seededUsers = await Promise.all(
            users.map(user => createUser(user.name, user.email, user.password, user.userRole))
        );
        console.log("Users Seeded Successfully!");

        console.log("Seeding Menu Items...");
        const seededItems = await Promise.all(
            menuItems.map(item => createMenuItem(item.name, item.description, item.basePrice, item.category))
        );
        console.log("Menu Items Seeded Successfully!");

        console.log("Seeding Toppings...");
        const seededToppings = await Promise.all(
            toppings.map(topping => createTopping(topping.name, topping.price, topping.availability))
        );
        console.log("Toppings Seeded Successfully!");

        console.log("Seeding Promo Codes...");
        await Promise.all(
            promoCodes.map(promo => createPromoCode(promo.code, promo.discount, promo.startDate, promo.endDate, promo.minOrderAmount))
        );
        console.log("Promo Codes Seeded Successfully!");

        console.log("Seeding Orders...");

        // Assign hardcoded users to specific orders
        const user1 = seededUsers[0]; // Danilo
        const user2 = seededUsers[2]; // Joel
        
        console.log(`Creating Order for ${user1.name}`);
        const order1 = await createOrder(user1._id, [
            { 
                product: seededItems[0]._id, 
                quantity: 2, 
                toppings: [seededToppings[1]._id]
            },
            { 
                product: seededItems[1]._id, 
                quantity: 1, 
                toppings: [seededToppings[1]._id, seededToppings[2]._id]
            }
        ], "No sugar added");
        
        console.log(`Creating Order for ${user2.name}`);

        const order2 = await createOrder(user2._id, [
            { 
                product: seededItems[2]._id, 
                quantity: 4, 
            },
            { 
                product: seededItems[3]._id, 
                quantity: 2, 
                toppings: [seededToppings[1]._id, seededToppings[3]._id]
            }
        ], "Less ice, please");
        
        console.log(`Order Created for ${user1.name}`);
        console.log(`Order Created for ${user2.name}`);
        
        console.log("Seeding Reviews...");

        const reviewer1 = seededUsers[1]; 
        const reviewer2 = seededUsers[3]; 

        console.log(`Creating Review from ${reviewer1.name}`);
        await createReview(reviewer1._id, seededItems[0]._id, 5, "Amazing taste and freshness!");

        console.log(`Creating Review from ${reviewer2.name}`);
        await createReview(reviewer2._id, seededItems[1]._id, 4, "Great flavor but a bit too sweet for me.");

        console.log(`Review Added by ${reviewer1.name}`);
        console.log(`Review Added by ${reviewer2.name}`);

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
