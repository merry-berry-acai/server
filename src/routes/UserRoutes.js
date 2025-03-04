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
const { checkAdminRole } = require("../middlewares/checkAdminRole");



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
router.get("/users/all",
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
router.get("/:id",
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
router.get("/",
    checkUserFirebaseUid,
    asyncHandler(async (req, res) => {
        const user = await getUserByUid(req.firebaseUid);
        sendSuccess(res, user);
    })
);

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

module.exports = router;
