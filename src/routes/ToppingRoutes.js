const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const {
    createTopping,
    getToppingById,
    getAllToppings,
    updateTopping,
    deleteTopping,
} = require("../controllers/toppingController");
const { checkUserFirebaseUid } = require("../middlewares/checkUser");
const { checkAdminRole } = require("../middlewares/checkAdminRole");

/**
 * Create a new topping
 */
router.post("/new",
    checkUserFirebaseUid,
    checkAdminRole,
    validateRequiredFields(['name', 'price']),
    asyncHandler(async (req, res) => {
        const { name, price, availability, category } = req.body;
        const newTopping = await createTopping(name, price, availability, category);
        sendSuccess(res, newTopping, "Topping created successfully", 201);
    })
);

/**
 * Get a topping by ID
 */
router.get("/:id",
    asyncHandler(async (req, res) => {
        const topping = await getToppingById(req.params.id);
        sendSuccess(res, topping);
    })
);

/**
 * Get all toppings
 */
router.get("/",
    asyncHandler(async (req, res) => {
        const toppings = await getAllToppings();
        sendSuccess(res, toppings);
    })
);

/**
 * Update a topping by ID
 */
router.put("/:id",
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        const updatedTopping = await updateTopping(req.params.id, req.body);
        sendSuccess(res, updatedTopping, "Topping updated successfully");
    })
);

/**
 * Delete a topping by ID
 */
router.delete("/:id",
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        const deletedTopping = await deleteTopping(req.params.id);
        sendSuccess(res, { id: deletedTopping._id }, `Topping '${deletedTopping._id}' successfully deleted`);
    })
);

module.exports = router;
