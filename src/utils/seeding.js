const { dbConnect, dbDisconnect } = require("./database");
const { createMenuItem } = require("../controllers/menuItemController");
const { createOrder } = require("../controllers/orderController");
const { createReview } = require("../controllers/reviewController");
const { createTopping } = require("../controllers/toppingController");
const { createUser } = require("../controllers/userController");
const { createCategory } = require("../controllers/categoryController");
const Logger = require("./logger");

// Sample Users
const users = [
    { uid: "danilo123", displayName: "Danilo", email: "danilo@example.com", role: "user" },
    { uid: "ethan456", displayName: "Ethan", email: "ethan@example.com", role: "user" },
    { uid: "joel789", displayName: "Joel", email: "joel@example.com", role: "user" },
    { uid: "peter101", displayName: "Peter", email: "peter@example.com", role: "admin" },
];

// Sample Categories
const categories = [
    { name: "smoothies" },
    { name: "acai bowls" },
    { name: "snacks" },
];

// Sample Menu Items
const menuItems = [
    {
        name: "Berry Blast Smoothie",
        description: "A vibrant blend of mixed berries, banana, and almond milk.",
        imageUrl: "/images/berry_blast.jpg",
        basePrice: 7.50,
        toppings: [
            "Fresh Berries",
            "Honey Drizzle",
            "Chia Seeds"
        ],
        category: "smoothies",
        availability: true
    },
    {
        name: "Tropical Green Smoothie",
        description: "Spinach, mango, pineapple, and coconut water for a refreshing boost.",
        imageUrl: "/images/tropical_green.jpg",
        basePrice: 8.00,
        toppings: [
            "Granola",
            "Coconut Flakes"
        ],
        category: "smoothies",
        availability: true
    },
    {
        name: "Choc Peanut Butter Smoothie",
        description: "Chocolate protein, banana, peanut butter, and oat milk. A protein-packed treat.",
        imageUrl: "/images/choc_pb_smoothie.jpg",
        basePrice: 8.50,
        toppings: [
            "Almond Butter",
            "Protein Powder (Whey)"
        ],
        category: "smoothies",
        availability: true
    },
    {
        name: "Classic Acai Bowl",
        description: "Organic Acai blended with banana, topped with granola and honey.",
        imageUrl: "/images/classic_acai_bowl.jpg",
        basePrice: 9.99,
        toppings: [
            "Honey Drizzle",
            "Granola"
        ],
        category: "acai bowls",
        availability: true
    },
    {
        name: "Tropical Acai Bowl",
        description: "Acai blended with mango and coconut water, topped with fresh mango, coconut flakes, and chia seeds.",
        imageUrl: "/images/tropical_acai_bowl.jpg",
        basePrice: 11.50,
        toppings: [
            "Mango Cubes",
            "Coconut Flakes",
            "Chia Seeds"
        ],
        category: "acai bowls",
        availability: true
    },
    {
        name: "Berry Nut Acai Bowl",
        description: "Acai with mixed berries, topped with almond butter, granola, and fresh berries.",
        imageUrl: "/images/berry_nut_acai_bowl.jpg",
        basePrice: 12.00,
        toppings: [
            "Almond Butter",
            "Granola",
            "Fresh Berries"
        ],
        category: "acai bowls",
        availability: true
    },
    {
        name: "Protein Bites (3 pack)",
        description: "Homemade energy bites with oats, peanut butter, and protein powder.",
        imageUrl: "/images/protein_bites.jpg",
        basePrice: 4.50,
        toppings: [],
        category: "snacks",
        availability: true
    },
    {
        name: "Fruit Salad Cup",
        description: "Freshly cut seasonal fruits. A light and healthy snack.",
        imageUrl: "/images/fruit_salad.jpg",
        basePrice: 5.00,
        toppings: [],
        category: "snacks",
        availability: true
    },
    {
        name: "Green Power Smoothie",
        description: "Kale, green apple, ginger, lemon, and banana.",
        imageUrl: "/images/green_power_smoothie.jpg",
        basePrice: 7.00,
        toppings: [
            "Banana Slices",
            "Chia Seeds"
        ],
        category: "smoothies",
        availability: true
    },
    {
        name: "Mango Tango Acai Bowl",
        description: "Acai blended with mango, banana, and orange juice, topped with mango, strawberry, and muesli.",
        imageUrl: "/images/mango_tango_acai_bowl.jpg",
        basePrice: 12.50,
        toppings: [
            "Mango Cubes",
            "Strawberry Slices",
            "Muesli"
        ],
        category: "acai bowls",
        availability: true
    }
];

// Sample Toppings
const toppings = [
    {
      name: "Chia Seeds",
      price: 0.75,
      availability: true
    },
    {
      name: "Honey Drizzle",
      price: 1.25,
      availability: true
    },
    {
      name: "Protein Powder (Whey)",
      price: 2.00,
      availability: true
    },
    {
      name: "Granola",
      price: 1.50,
      availability: true
    },
    {
      name: "Fresh Berries",
      price: 2.50,
      availability: true
    },
    {
      name: "Coconut Flakes",
      price: 1.00,
      availability: true
    },
    {
      name: "Almond Butter",
      price: 1.75,
      availability: true
    },
    {
      name: "Extra Acai",
      price: 3.00,
      availability: true
    },
    {
      name: "Muesli",
      price: 1.50,
      availability: true
    },
    {
      name: "Banana Slices",
      price: 1.00,
      availability: true
    },
    {
      name: "Strawberry Slices",
      price: 1.50,
      availability: true
    },
    {
      name: "Mango Cubes",
      price: 2.00,
      availability: true
    }
];


// Function to seed the database
async function seedDatabase() {
    try {
        await dbConnect();
        Logger.info("Database Connected...");

        Logger.info("Seeding Users...");
        const seededUsers = await Promise.all(
            users.map(user => createUser(user))
        );
        Logger.success("Users Seeded Successfully!");

        Logger.info("Seeding Categories...");
        const seededCategories = await Promise.all(
            categories.map(category => createCategory(category.name))
        );
        Logger.success("Categories Seeded Successfully!");

        Logger.info("Seeding Toppings...");
        const seededToppings = await Promise.all(            toppings.map(topping => createTopping(topping.name, topping.price, topping.availability))        );        Logger.success("Toppings Seeded Successfully!");        Logger.info("Seeding Menu Items...");        const seededItems = await Promise.all(
            menuItems.map(item => {
                // Use the predefined toppings instead of random ones
                return createMenuItem(
                    item.name,
                    item.description,
                    item.basePrice,
                    item.category,
                    item.toppings,
                    item.imageUrl || ""
                );
            })
        ); // Missing closing parenthesis was here
        Logger.success("Menu Items Seeded Successfully!");

        Logger.info("Seeding Orders...");

        // Assign hardcoded users to specific orders
        const user1 = seededUsers[0]; // Danilo
        const user2 = seededUsers[2]; // Joel

        // Use displayName instead of name property
        // Logger.info(`Creating Order for ${user1.displayName}`);
        // const order1 = await createOrder(user1._id, [
        //     {
        //         product: seededItems[0]._id,
        //         quantity: 2,
        //         toppings: [seededToppings[1]._id]
        //     },
        //     {
        //         product: seededItems[1]._id,
        //         quantity: 1,
        //         toppings: [seededToppings[1]._id, seededToppings[2]._id]
        //     }
        // ], "No sugar added");

        // // Use displayName instead of name property
        // Logger.info(`Creating Order for ${user2.displayName}`);
        // const order2 = await createOrder(user2._id, [
        //     {
        //         product: seededItems[2]._id,
        //         quantity: 4,
        //     },
        //     {
        //         product: seededItems[3]._id,
        //         quantity: 2,
        //         toppings: [seededToppings[1]._id, seededToppings[3]._id]
        //     }
        // ], "Less ice, please");

        // // Use displayName instead of name property
        // Logger.success(`Order Created for ${user1.displayName}`);
        // Logger.success(`Order Created for ${user2.displayName}`);

        // Logger.info("Seeding Reviews...");

        // const reviewer1 = seededUsers[1];
        // const reviewer2 = seededUsers[3];

        // // Use displayName instead of name property
        // Logger.info(`Creating Review from ${reviewer1.displayName}`);
        // await createReview(reviewer1._id, seededItems[0]._id, 5, "Amazing taste and freshness!");

        // // Use displayName instead of name property
        // Logger.info(`Creating Review from ${reviewer2.displayName}`);
        // await createReview(reviewer2._id, seededItems[1]._id, 4, "Great flavor but a bit too sweet for me.");

        // // Use displayName instead of name property
        // Logger.success(`Review Added by ${reviewer1.displayName}`);
        // Logger.success(`Review Added by ${reviewer2.displayName}`);

        Logger.success("Seeding Completed Successfully!");
    } catch (error) {
        Logger.error("Error seeding database: " + error.message);
        // Print full error details for debugging
        console.error(error);
    } finally {
        await dbDisconnect();
        Logger.info("Database Disconnected.");
    }
}

// Run the seed function
seedDatabase();
