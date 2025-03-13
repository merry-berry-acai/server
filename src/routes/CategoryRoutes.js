const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");
const { checkUserFirebaseUid } = require("../middlewares/checkUser");
const { checkAdminRole } = require("../middlewares/checkAdminRole");

// Create a category
router.post("/new",
    checkUserFirebaseUid,
    checkAdminRole,
    validateRequiredFields(['name']),
    asyncHandler(async (req, res) => {
        const { name } = req.body;
        const category = await createCategory(name);

        if (category.error) {
            return res.status(category.status || 400).json(category);
        }

        sendSuccess(res, category, "Category created successfully", 201);
    })
);

// Get all categories
router.get("/",
    asyncHandler(async (req, res) => {
        const categories = await getAllCategories();
        sendSuccess(res, categories);
    })
);

// Get category by ID
router.get("/:id",
    asyncHandler(async (req, res) => {
        const category = await getCategoryById(req.params.id);
        sendSuccess(res, category);
    })
);

// Update category
router.put("/:id",
    checkUserFirebaseUid,
    checkAdminRole,
    validateRequiredFields(['name']),
    asyncHandler(async (req, res) => {
        const { name } = req.body;
        const updatedCategory = await updateCategory(req.params.id, name);
        sendSuccess(res, updatedCategory, "Category updated successfully");
    })
);

// Delete category
router.delete("/:id",
    checkUserFirebaseUid,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        const deletedCategory = await getCategoryById(req.params.id);
        await deleteCategory(req.params.id);
        sendSuccess(res, { id: deletedCategory._id }, `Category '${deletedCategory.name}' successfully deleted`);
    })
);

module.exports = router;
