const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/tenants.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// LECTURE
// TOUS LES RÔLES
// =========================================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE",
        "AGENT"
    ),
    controller.getAll
);


router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE",
        "AGENT"
    ),
    controller.getById
);


// =========================================================
// CRÉATION / MODIFICATION
// ADMIN / RESPONSABLE
// =========================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE"
    ),
    controller.create
);


router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE"
    ),
    controller.update
);


// =========================================================
// SUPPRESSION
// ADMIN UNIQUEMENT
// =========================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN"
    ),
    controller.remove
);


module.exports = router;