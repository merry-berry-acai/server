const express = require("express");
const router = express.Router();
const { validateRequiredFields } = require("../middlewares/validate");
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { checkDuplicateUser } = require("../middlewares/checkDuplicateUser");
const {
  checkUserFirebaseUid,
  checkUserId,
} = require("../middlewares/checkUser");
const {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByUid,
  updateUserByUid,
  deleteUserByUid,
  getUserOrders,
} = require("../controllers/userController");
const { checkAdminRole } = require("../middlewares/checkAdminRole");

/**
 * Create a new user
 */

router.post(
  "/register",
  validateRequiredFields(["displayName", "email"]),
  checkDuplicateUser,
  checkUserFirebaseUid,
  asyncHandler(async (req, res) => {
    if (req.firebaseUid == null) {
      console.error("Firebase UID is required");
      return res.status(400).json({ error: "Firebase UID is required" });
    }
    const userData = {
      uid: req.firebaseUid, // Firebase authentication id is extracted from the header using the middleware checkuser
      displayName: req.body.displayName,
      email: req.body.email,
      photoURL: req.body.photoURL,
      favorites: req.body.favorites || [],
      role: req.body.role || "user",
    };

    const newUser = await createUser(userData);
    sendSuccess(res, newUser, "User successfully registered", 201);
  })
);

/**
 * Get user role by Id
 */
router.get(
  "/:id/role",
  checkUserFirebaseUid,
  checkAdminRole,
  asyncHandler(async (req, res) => {
    const roleData = await getUserById(req.params.id);
    sendSuccess(res, roleData.role);
  })
);

/**
 * Get all users
 */
router.get(
  "/all",
  checkUserFirebaseUid,
  checkAdminRole,
  asyncHandler(async (req, res) => {
    console.log("all good");
    const users = await getAllUsers();
    sendSuccess(res, users);
  })
);

/**
 * Get user by Id (Get any user info. MUST be admin)
 */
router.get(
  "/:id",
  checkUserFirebaseUid,
  checkAdminRole,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    sendSuccess(res, user);
  })
);

/**
 * Get user by Firebase UID (only the authenticated user itself)
 */
router.get(
  "/",
  checkUserFirebaseUid,
  asyncHandler(async (req, res) => {
    const user = await getUserByUid(req.firebaseUid);
    sendSuccess(res, user);
  })
);

/**
 * Update a user by ID
 * - Admins can update any user
 * - Regular users can only update their own profile
 */
router.put(
  "/:id",
  checkUserFirebaseUid,
  checkDuplicateUser,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const authUserUid = req.firebaseUid;

    try {
      // Get the authenticated user making the request
      const authUser = await getUserByUid(authUserUid);
      if (!authUser) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Your user account could not be verified",
        });
      }

      // Get the target user to be updated
      const targetUser = await getUserById(userId);
      if (!targetUser) {
        return res.status(404).json({
          error: "User not found",
          message: `No user found with ID: ${userId}`,
        });
      }

      // Check if admin or self-update
      const isAdmin = authUser.role === "admin";
      const isSelfUpdate =
        targetUser._id.toString() === authUser._id.toString();

      if (!isAdmin && !isSelfUpdate) {
        return res.status(403).json({
          error: "Permission denied",
          message: "You do not have permission to update this user account",
        });
      }

      // Prevent regular users from changing their role
      if (!isAdmin && req.body.role && req.body.role !== targetUser.role) {
        return res.status(403).json({
          error: "Permission denied",
          message: "You do not have permission to change user roles",
        });
      }

      // Perform the update with the appropriate function
      const updatedUser = await updateUser(userId, req.body);

      sendSuccess(res, updatedUser, "User successfully updated");
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(error.statusCode || 500).json({
        error: "Failed to update user",
        details: error.message || "Unknown server error during update",
      });
    }
  })
);

/**
 * Update authenticated user's own profile (alternative route)
 */
router.put(
  "/me/update",
  checkUserFirebaseUid,
  checkDuplicateUser,
  asyncHandler(async (req, res) => {
    try {
      // Prevent users from changing their own role
      if (req.body.role) {
        delete req.body.role;
      }

      const updatedUser = await updateUserByUid(req.firebaseUid, req.body);
      if (!updatedUser) {
        return res.status(404).json({
          error: "Account not found",
          message: "Your user account could not be found",
        });
      }

      sendSuccess(
        res,
        updatedUser,
        "Your profile has been successfully updated"
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(error.statusCode || 500).json({
        error: "Failed to update profile",
        details: error.message || "An unexpected error occurred",
      });
    }
  })
);

/**
 * Delete a user - either by self or by admin
 * If admin, can delete any user by ID
 * If regular user, can only delete their own account
 */
router.delete(
  "/:id",
  checkUserFirebaseUid,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const authUserUid = req.firebaseUid;

    try {
      // First, get the user making the request
      const authUser = await getUserByUid(authUserUid);
      if (!authUser) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Your user account could not be verified",
        });
      }

      // Check if admin or self-deletion
      const isAdmin = authUser.role === "admin";
      const targetUser = await getUserById(userId);

      if (!targetUser) {
        return res.status(404).json({
          error: "User not found",
          message: `No user found with ID: ${userId}`,
        });
      }

      // Allow deletion only if admin or if user is deleting their own account
      if (isAdmin || targetUser._id.toString() === authUser._id.toString()) {
        // Perform the deletion
        const deletedUser = await deleteUser(userId);

        sendSuccess(res, {
          message: `User successfully deleted`,
          deletedUserId: userId,
        });
      } else {
        return res.status(403).json({
          error: "Permission denied",
          message: "You do not have permission to delete this user account",
        });
      }
    } catch (error) {
      console.error("Error during user deletion:", error);
      return res.status(error.statusCode || 500).json({
        error: "Failed to delete user",
        details: error.message || "Unknown server error during deletion",
      });
    }
  })
);

/**
 * Delete authenticated user's own account (alternative route)
 */
router.delete(
  "/me/delete",
  checkUserFirebaseUid,
  asyncHandler(async (req, res) => {
    try {
      const deletedUser = await deleteUserByUid(req.firebaseUid);
      if (!deletedUser) {
        return res.status(404).json({
          error: "Account not found",
          message: "Your user account could not be found",
        });
      }
      sendSuccess(res, {
        message: "Your account has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting user account:", error);
      return res.status(error.statusCode || 500).json({
        error: "Failed to delete account",
        details: error.message || "An unexpected error occurred",
      });
    }
  })
);

/**
 * Get orders for a specific user - either the user's own orders or admin access
 */
router.get(
  "/:id/orders",
  checkUserFirebaseUid,
  checkUserId, // Add this to attach user data to request
  checkAdminRole, // This middleware now supports "self or admin" access
  asyncHandler(async (req, res) => {
    const orders = await getUserOrders(req.params.id);
    sendSuccess(res, orders, "Orders retrieved successfully");
  })
);

/**
 * Get authenticated user's own orders
 */
router.get(
  "/orders/me",
  checkUserFirebaseUid,
  checkUserId,
  asyncHandler(async (req, res) => {
    if (!req.firebaseUid) {
      return res.status(401).json({
        error: "Unauthorized: Authentication required",
        message: "You must be logged in to view your orders.",
        code: "AUTH_REQUIRED",
      });
    }

    const orders = await getUserOrders(req.firebaseUid);
    sendSuccess(res, orders, "Your orders retrieved successfully");
  })
);

module.exports = router;
