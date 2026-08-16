const express = require("express");

const router = express.Router();

const UsersController =
    require("../controllers/users.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// LECTURE
// ADMIN UNIQUEMENT
// =========================================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.getAll
);


router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.getById
);


// =========================================================
// CRÉATION
// ADMIN UNIQUEMENT
// =========================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.create
);


// =========================================================
// MODIFICATION
// ADMIN UNIQUEMENT
// =========================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.update
);


// =========================================================
// MODIFICATION DU MOT DE PASSE
// ADMIN UNIQUEMENT
// =========================================================

router.put(
    "/:id/password",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.updatePassword
);


// =========================================================
// ACTIVATION / DÉSACTIVATION
// ADMIN UNIQUEMENT
// =========================================================

router.put(
    "/:id/status",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.updateActive
);


// =========================================================
// SUPPRESSION
// ADMIN UNIQUEMENT
// =========================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    UsersController.remove
);


module.exports = router;