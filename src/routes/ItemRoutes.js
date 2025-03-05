const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const {
    createMenuItem,
    getMenuItemById,
    getAllMenuItems,
    updateMenuItem,
    deleteMenuItem,
    getItemsByCategory,
} = require("../controllers/menuItemController");
const { checkUserFirebaseUid } = require("../middlewares/checkUser");
const { checkAdminRole } = require("../middlewares/checkAdminRole");
const { validateCategory } = require("../middlewares/validateItemCategory");

// Create a new menu item passing the names of toppings and name of category
router.post("/new",
    validateRequiredFields(['name', 'basePrice', 'category']),
    validateCategory,
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        // get the categopryId from the middleware afer validation
        category = req.categoryId;
        const { name, description, basePrice, toppings, imageUrl } = req.body;
        const newItem = await createMenuItem(name, description, basePrice, category, toppings, imageUrl);

        if (newItem.error) {
            return res.status(newItem.status || 400).json(newItem);
        }

        sendSuccess(res, newItem, "Menu item created successfully", 201);
    })
);

// Get a menu item by ID
router.get("/:id",
    asyncHandler(async (req, res) => {
        const menuItem = await getMenuItemById(req.params.id);
        sendSuccess(res, menuItem);
    })
);

// Get all menu items
router.get("/",
    asyncHandler(async (req, res) => {
        const menuItems = await getAllMenuItems();
        sendSuccess(res, menuItems);
    })
);

// Get featured items (first 3 items)
router.get("/home/featured",
    asyncHandler(async (req, res) => {
        const menuItems = await getAllMenuItems(3);
        sendSuccess(res, menuItems);
    })
);

// Get items by category
router.get("/category/:categoryName",
    asyncHandler(async (req, res) => {
        const { categoryName } = req.params;
        const result = await getItemsByCategory(categoryName);

        if (result.error) {
            return res.status(400).json(result);
        }

        sendSuccess(res, result);
    })
);

// Update a menu item by ID
router.patch("/:id",
    validateCategory, 
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res, next) => {
        try {
            const { id } = req.params;
            
            // Dynamically build the update object
            const updateData = { ...req.body };

            // If category is provided, use the validated categoryId from middleware
            if (req.body.category) {
                updateData.category = req.categoryId; //Only update category if provided
            }

            const updatedItem = await updateMenuItem(id, updateData);

            return sendSuccess(res, updatedItem, "Menu item updated successfully", 200);
        } catch (error) {
            next(error); 
        }
    })
);


// Delete a menu item by ID
router.delete("/:id",
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        const deletedItem = await getMenuItemById(req.params.id);
        await deleteMenuItem(req.params.id);
        sendSuccess(res, { id: req.params.id }, `Menu item '${deletedItem.name}' successfully deleted`);
    })
);

module.exports = router;
