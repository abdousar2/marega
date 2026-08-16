const express = require("express");

const router = express.Router();

const LeasesController =
    require("../controllers/leases.controller");

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
    LeasesController.getAll
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
    LeasesController.getById
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
    LeasesController.create
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE"
    ),
    LeasesController.update
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
    LeasesController.remove
);


module.exports = router;