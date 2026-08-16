const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/apartments.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// CONSULTATION
// ADMIN / RESPONSABLE / COMPTABLE / AGENT
// =========================================================

// Tous les appartements
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


// Tous les appartements d'un immeuble
router.get(
    "/building/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE",
        "AGENT"
    ),
    controller.getByBuilding
);


// Un appartement
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
// MODIFICATION
// ADMIN / RESPONSABLE
// =========================================================

// Création
router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE"
    ),
    controller.create
);


// Modification
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE"
    ),
    controller.update
);


// Suppression
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
    ),
    controller.remove
);


module.exports = router;