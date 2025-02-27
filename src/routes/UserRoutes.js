const express = require("express");
const router = express.Router();
const { checkDuplicateUser } = require("../middlewares/checkDuplicateUser");
const {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
} = require("../controllers/userController");


/**
 * Create a new user
 */
// Middleware `checkDuplicateUser` runs before `createUser`
router.post("/register", async (req, res) => {
  try {
      const { displayName, email, admin } = req.body;
      const newUser = await createUser(displayName, email, admin);
      res.status(201).json(newUser);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


/**
 * Get user by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.status(200).json(user);
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

/**
 * Update a user by ID
 */
router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a user by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);
    res.status(200).json({ message: `User '${deletedUser._id}' successfully deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
