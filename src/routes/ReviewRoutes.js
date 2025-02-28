const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { validateRequiredFields } = require("../middlewares/validate");
const {
  createReview,
  getReviewById,
  getReviewsByItem,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

/**
 * Create a new review
 */
router.post("/new", 
  validateRequiredFields(['userId', 'itemId', 'rating']),
  asyncHandler(async (req, res) => {
    const { userId, itemId, rating, comment = "" } = req.body;
    const newReview = await createReview(userId, itemId, rating, comment);
    sendSuccess(res, newReview, "Review created successfully", 201);
  })
);

/**
 * Get a review by ID
 */
router.get("/:id", 
  asyncHandler(async (req, res) => {
    const review = await getReviewById(req.params.id);
    sendSuccess(res, review);
  })
);

/**
 * Get all reviews for a specific menu item
 */
router.get("/item/:itemId", 
  asyncHandler(async (req, res) => {
    const reviews = await getReviewsByItem(req.params.itemId);
    sendSuccess(res, reviews);
  })
);

/**
 * Get all reviews
 */
router.get("/", 
  asyncHandler(async (req, res) => {
    const reviews = await getAllReviews();
    sendSuccess(res, reviews);
  })
);

/**
 * Update a review by ID
 */
router.patch("/:id", 
  asyncHandler(async (req, res) => {
    const updatedReview = await updateReview(req.params.id, req.body);
    sendSuccess(res, updatedReview, "Review updated successfully");
  })
);

/**
 * Delete a review by ID
 */
router.delete("/:id", 
  asyncHandler(async (req, res) => {
    const deletedReview = await deleteReview(req.params.id);
    sendSuccess(res, { id: deletedReview._id }, `Review '${deletedReview._id}' successfully deleted`);
  })
);

module.exports = router;
