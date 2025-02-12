const express = require("express");
const router = express.Router();
const {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  authenticateUser,
} = require("../controllers/userController");

/**
 * Create a new user
 */
router.post("/new", async (req, res) => {
  try {
    const { name, email, password, userRole } = req.body;
    const newUser = await createUser(name, email, password, userRole);
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Authenticate user (Login)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authenticatedUser = await authenticateUser(email, password);
    res.status(200).json({ message: "Authentication successful", data: authenticatedUser });
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
    res.status(200).json({ message: "Request successful", data: user });
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
    res.status(200).json({ message: "Request successful", data: users });
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
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
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
