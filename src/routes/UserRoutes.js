const express = require("express");
const router = express.Router();
const { validateRequiredFields } = require("../middlewares/validate");
const { asyncHandler } = require("../utils/errorHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { checkDuplicateUser } = require("../middlewares/checkDuplicateUser");
const { checkUserFirebaseUid } = require("../middlewares/checkUser");
const {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserByUid,
    updateUserByUid,
    deleteUserByUid
} = require("../controllers/userController");



/**
 * Create a new user
 */

router.post("/register",
    validateRequiredFields(['displayName', 'email']),
    checkDuplicateUser,
    checkUserFirebaseUid,
    asyncHandler(async (req, res) => {
        if (req.firebaseUid == null) {
            console.error('Firebase UID is required');
            return res.status(400).json({ error: 'Firebase UID is required' });
        }
        const userData = {
            uid: req.firebaseUid, // Firebase authentication id is extracted from the header using the middleware checkuser
            displayName: req.body.displayName,
            email: req.body.email,
            photoURL: req.body.photoURL,
            favorites: req.body.favorites || [],
            role: req.body.role || 'user'
        };

        const newUser = await createUser(userData);
        sendSuccess(res, newUser, 'User successfully registered', 201);
    })
);


/**
 * Get user role by Id
 */
router.get("/:id/role",
    asyncHandler(async (req, res) => {
        const roleData = await getUserById(req.params.id);
        sendSuccess(res, roleData.role);
    })
);

/**
 * Get user by Id
 */
router.get("/:id",
    asyncHandler(async (req, res) => {
        const user = await getUserById(req.params.id);
        sendSuccess(res, user);
    })
);

// /**
//  * Get user by Firebase UID
//  */
// router.get("/:uid",
//     validateUid,
//     asyncHandler(async (req, res) => {
//         const user = await getUserByUid(req.params.uid);
//         sendSuccess(res, user);
//     })
// );

/**
 * Update a user by Firebase UID
 */
router.patch("/",
    checkUserFirebaseUid,
    checkDuplicateUser,
    asyncHandler(async (req, res) => {
        const updatedUser = await updateUserByUid(req.firebaseUid, req.body);
        sendSuccess(res, updatedUser);
    })
);

/**
 * Delete a user by Firebase UID
 */
//Only authenticated user can delete their own account 
router.delete("/",
    checkUserFirebaseUid,
    asyncHandler(async (req, res) => {
        const deletedUser = await deleteUserByUid(req.firebaseUid);
        sendSuccess(res, { message: `User with UID '${req.firebaseUid}' successfully deleted.` });
    })
);

/**
 * Get all users
 */
router.get("/",
    asyncHandler(async (req, res) => {
        const users = await getAllUsers();
        sendSuccess(res, users);
    })
);

module.exports = router;
