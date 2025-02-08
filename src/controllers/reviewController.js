const { Review } = require("../models/Review");

async function createReview(userId, itemId, rating, comment = "") {
  try {
    const newReview = new Review({
      userId,
      itemId,
      rating,
      comment,
    });

    await newReview.save();
    return newReview;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("Failed to create review");
  }
}

async function getReviewById(reviewId) {
  try {
    const review = await Review.findById(reviewId)
      .populate("userId", "name email")
      .populate("itemId", "name");
    if (!review) throw new Error("Review not found");
    return review;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw new Error("Failed to fetch review");
  }
}

async function getReviewsByItem(itemId) {
  try {
    return await Review.find({ itemId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching reviews for item:", error);
    throw new Error("Failed to fetch reviews");
  }
}

async function getAllReviews() {
  try {
    return await Review.find()
      .populate("userId", "name email")
      .populate("itemId", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("Failed to fetch reviews");
  }
}

async function updateReview(reviewId, updateData) {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate("userId", "name").populate("itemId", "name");

    if (!updatedReview) throw new Error("Review not found or update failed");
    return updatedReview;
  } catch (error) {
    console.error("Error updating review:", error);
    throw new Error("Failed to update review");
  }
}

async function deleteReview(reviewId) {
  try {
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) throw new Error("Review not found or already deleted");
    return deletedReview;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }
}

module.exports = {
  createReview,
  getReviewById,
  getReviewsByItem,
  getAllReviews,
  updateReview,
  deleteReview,
};
