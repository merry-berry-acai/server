const express = require("express");
const router = express.Router();
const { checkDuplicateUser } = require("../middlewares/checkDuplicateUser");
const {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserRoleByUid,
  getUserByUid,
  updateUserByUid,
  deleteUserByUid
} = require("../controllers/userController");

// Remove the request logging middleware from here as it's now handled globally

/**
 * Create a new user
 */
// Middleware `checkDuplicateUser` runs before `createUser`
router.post("/register", checkDuplicateUser, async (req, res) => {
  try {
      const userData = {
        uid: req.body.uid,
        displayName: req.body.displayName,
        email: req.body.email,
        photoURL: req.body.photoURL,
        favorites: req.body.favorites || [],
        role: req.body.role || 'user'
      };
      
      const newUser = await createUser(userData);
      res.status(201).json(newUser);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

/**
 * Get user role by Firebase UID
 */
router.get("/:uid/role", async (req, res) => {
  try {
    const roleData = await getUserRoleByUid(req.params.uid);
    res.status(200).json(roleData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user by Firebase UID
 */
router.get("/:uid", async (req, res) => {
  try {
    const user = await getUserByUid(req.params.uid);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update a user by Firebase UID
 */
router.patch("/:uid", async (req, res) => {
  try {
    const updatedUser = await updateUserByUid(req.params.uid, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a user by Firebase UID
 */
router.delete("/:uid", async (req, res) => {
  try {
    const deletedUser = await deleteUserByUid(req.params.uid);
    res.status(200).json({ message: `User with UID '${req.params.uid}' successfully deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all users
 */
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
