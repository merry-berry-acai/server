const { dbConnect, dbDisconnect } = require('./database');
const { createMenuItem } = require('../controllers/menuItemController');


// Function to seed the MenuItems table with Smoothie and Akai products
async function seedMenuItems() {
    const menuItems = [
        { name: 'Smoothie', description: 'A fresh and fruity smoothie', basePrice: 5.99, category: 'smoothie' },
        { name: 'Akai Juice', description: 'Refreshing Akai berry juice', basePrice: 4.99, category: 'akai' },
        { name: 'Smoothie Bowl', description: 'Fruit smoothie bowl with toppings', basePrice: 7.49, category: 'smoothie' },
        { name: 'Akai Smoothie', description: 'Akai-based smoothie with a touch of honey', basePrice: 6.49, category: 'smoothie' },
    ];

    try {
        // Connect to the database
        await dbConnect();

        // Seed each item into the MenuItems table using createMenuItem function
        for (const item of menuItems) {
            await createMenuItem(item.name, item.description, item.basePrice, item.category);
            console.log(`Added ${item.name} to the MenuItems table`);
        }

        console.log('Seeding completed!');
    } catch (error) {
        console.error('Error seeding MenuItems:', error);
    } finally {
        // Disconnect from the database
        await dbDisconnect();
    }
}

// Run the seed function
seedMenuItems();
