const { dbConnect, dbDisconnect } = require("./database");
const { createMenuItem } = require("../controllers/menuItemController");
const { createOrder } = require("../controllers/orderController");
const { createTopping, getAllToppings } = require("../controllers/toppingController");
const { createUser } = require("../controllers/userController");
const { createCategory, getAllCategories } = require("../controllers/categoryController");
const Logger = require("./logger");
const path = require("path");
const fs = require("fs");

// Sample Users
const users = [
    {
        uid: "danilo123",
        displayName: "Danilo",
        email: "danilo@example.com",
        role: "user",
    },
    {
        uid: "ethan456",
        displayName: "Ethan",
        email: "ethan@example.com",
        role: "user",
    },
    {
        uid: "joel789",
        displayName: "Joel",
        email: "joel@example.com",
        role: "user",
    },
    {
        uid: "peter101",
        displayName: "Peter",
        email: "peter@example.com",
        role: "admin",
    },
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
        imageUrl: "/images/berry-blast-smoothie.jpeg",
        basePrice: 7.5,
        //toppings: ["Fresh Berries", "Honey Drizzle", "Chia Seeds"],
        //category: "smoothies",
        availability: true,
    },
    {
        name: "Tropical Green Smoothie",
        description:
            "Spinach, mango, pineapple, and coconut water for a refreshing boost.",
        imageUrl: "/images/tropical-green-smoothie.jpeg",
        basePrice: 8.0,
        //toppings: ["Granola", "Coconut Flakes"],
        //category: "smoothies",
        availability: true,
    },
    {
        name: "Choc Peanut Butter Smoothie",
        description:
            "Chocolate protein, banana, peanut butter, and oat milk. A protein-packed treat.",
        imageUrl: "/images/choc-peanut-smoothie.jpeg",
        basePrice: 8.5,
        //toppings: ["Almond Butter", "Protein Powder (Whey)"],
        //category: "smoothies",
        availability: true,
    },
    {
        name: "Classic Acai Bowl",
        description:
            "Organic Acai blended with banana, topped with granola and honey.",
        imageUrl: "/images/classic-acai-bowl.jpeg",
        basePrice: 9.99,
        //toppings: ["Honey Drizzle", "Granola"],
        //category: "acai bowls",
        availability: true,
    },
    {
        name: "Tropical Acai Bowl",
        description:
            "Acai blended with mango and coconut water, topped with fresh mango, coconut flakes, and chia seeds.",
        imageUrl: "/images/tropical-acai-bowl.jpeg",
        basePrice: 11.5,
        //toppings: ["Mango Cubes", "Coconut Flakes", "Chia Seeds"],
        //category: "acai bowls",
        availability: true,
    },
    {
        name: "Berry Nut Acai Bowl",
        description:
            "Acai with mixed berries, topped with almond butter, granola, and fresh berries.",
        imageUrl: "/images/berry-nut-acai-bowl.jpeg",
        basePrice: 12.0,
        //toppings: ["Almond Butter", "Granola", "Fresh Berries"],
        //category: "acai bowls",
        availability: true,
    },
    {
        name: "Protein Bites (3 pack)",
        description:
            "Homemade energy bites with oats, peanut butter, and protein powder.",
        imageUrl: "/images/protein-bites.jpeg",
        basePrice: 4.5,
        //toppings: [],
        //category: "snacks",
        availability: true,
    },
    {
        name: "Fruit Salad Cup",
        description: "Freshly cut seasonal fruits. A light and healthy snack.",
        imageUrl: "/images/fruit-salad.jpeg",
        basePrice: 5.0,
        //toppings: [],
        //category: "snacks",
        availability: true,
    },
    {
        name: "Green Power Smoothie",
        description: "Kale, green apple, ginger, lemon, and banana.",
        imageUrl: "/images/green-power-smoothie.jpeg",
        basePrice: 7.0,
        //toppings: ["Banana Slices", "Chia Seeds"],
        //category: "smoothies",
        availability: true,
    },
    {
        name: "Mango Tango Acai Bowl",
        description:
            "Acai blended with mango, banana, and orange juice, topped with mango, strawberry, and muesli.",
        imageUrl: "/images/mango-tango-bowl.jpeg",
        basePrice: 12.5,
        //toppings: ["Mango Cubes", "Strawberry Slices", "Muesli"],
        //category: "acai bowls",
        availability: true,
    },
];

// Sample Toppings
const toppings = [
    {
        name: "Chia Seeds",
        price: 0.75,
        availability: true,
    },
    {
        name: "Honey Drizzle",
        price: 1.25,
        availability: true,
    },
    {
        name: "Protein Powder (Whey)",
        price: 2.0,
        availability: true,
    },
    {
        name: "Granola",
        price: 1.5,
        availability: true,
    },
    {
        name: "Fresh Berries",
        price: 2.5,
        availability: true,
    },
    {
        name: "Coconut Flakes",
        price: 1.0,
        availability: true,
    },
    {
        name: "Almond Butter",
        price: 1.75,
        availability: true,
    },
    {
        name: "Extra Acai",
        price: 3.0,
        availability: true,
    },
    {
        name: "Muesli",
        price: 1.5,
        availability: true,
    },
    {
        name: "Banana Slices",
        price: 1.0,
        availability: true,
    },
    {
        name: "Strawberry Slices",
        price: 1.5,
        availability: true,
    },
    {
        name: "Mango Cubes",
        price: 2.0,
        availability: true,
    },
];

// Function to ensure images directory exists
const ensureImagesDirectory = () => {
    const publicDir = path.join(__dirname, "../../public");
    const imagesDir = path.join(publicDir, "images");

    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
        Logger.info("Created public directory");
    }

    // Create images directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
        Logger.info("Created images directory");
    }

    return imagesDir;
};

// Function to check if images exist
const validateImages = () => {
    const imagesDir = ensureImagesDirectory();

    // Check if each image referenced in menuItems exists
    const missingImages = [];
    menuItems.forEach((item) => {
        if (item.imageUrl) {
            // Extract filename from imageUrl (remove /images/ prefix)
            const filename = item.imageUrl.replace("/images/", "");
            const imagePath = path.join(imagesDir, filename);

            if (!fs.existsSync(imagePath)) {
                missingImages.push({
                    item: item.name,
                    path: imagePath,
                });
            }
        }
    });

    if (missingImages.length > 0) {
        Logger.warn("Some images are missing:");
        missingImages.forEach((img) => {
            Logger.warn(`- ${img.item}: ${img.path}`);
        });
    } else {
        Logger.success("All images are available");
    }
};

// Function to seed the database
async function seedDatabase() {
    try {
        await dbConnect();
        Logger.info("Database Connected...");

        // Check if all referenced images exist
        validateImages();

        Logger.info("Seeding Users...");
        const seededUsers = await Promise.all(
            users.map((user) => createUser(user))
        );
        Logger.success("Users Seeded Successfully!");

    Logger.info("Seeding Categories...");
    const seededCategories = await Promise.all(
      categories.map((category) => createCategory(category.name))
    );
    Logger.success("Categories Seeded Successfully!");

    // Create a map of category names to category IDs for easy lookup
    const categoryMap = {};
    seededCategories.forEach((category) => {
      categoryMap[category.name.toLowerCase()] = category._id;
    });

    Logger.info("Seeding Toppings...");
    const seededToppings = await Promise.all(
      toppings.map((topping) =>
        createTopping(topping.name, topping.price, topping.availability)
      )
    );
    Logger.success("Toppings Seeded Successfully!");

    // Create a map of topping names to topping IDs for easy lookup
    const toppingMap = {};
    seededToppings.forEach((topping) => {
      toppingMap[topping.name] = topping._id;
    });

    Logger.info("Seeding Menu Items...");
    const seededItems = await Promise.all(
      menuItems.map((item) => {
        // Convert category name to category ID
        const categoryId = categoryMap[item.category.toLowerCase()];
        if (!categoryId) {
          throw new Error(`Category not found: ${item.category}`);
        }

        // Convert topping names to topping IDs
        const toppingIds = item.toppings.map((toppingName) => {
          const toppingId = toppingMap[toppingName];
          if (!toppingId) {
            throw new Error(`Topping not found: ${toppingName}`);
          }
          return toppingId;
        });

        return createMenuItem(
          item.name,
          item.description,
          item.basePrice,
          categoryId, // Use the category ID instead of name
          toppingIds, // Use the topping IDs instead of names
          item.imageUrl || ""
        );
      })
    );
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
