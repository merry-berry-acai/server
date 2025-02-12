const express = require("express");
const router = express.Router();
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
router.post("/new", async (req, res) => {
  try {
    const { userId, itemId, rating, comment = "" } = req.body;
    const newReview = await createReview(userId, itemId, rating, comment);
    res.status(201).json({ message: "Review created successfully", data: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a review by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    res.status(200).json({ message: "Request successful", data: review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all reviews for a specific menu item
 */
router.get("/item/:itemId", async (req, res) => {
  try {
    const reviews = await getReviewsByItem(req.params.itemId);
    res.status(200).json({ message: "Request successful", data: reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all reviews
 */
router.get("/", async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.status(200).json({ message: "Request successful", data: reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update a review by ID
 */
router.patch("/:id", async (req, res) => {
  try {
    const updatedReview = await updateReview(req.params.id, req.body);
    res.status(200).json({ message: "Review updated successfully", data: updatedReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a review by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedReview = await deleteReview(req.params.id);
    res.status(200).json({ message: `Review '${deletedReview._id}' successfully deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
