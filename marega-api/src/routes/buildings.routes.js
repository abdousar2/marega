const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/buildings.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// CONSULTATION
// ADMIN / RESPONSABLE / COMPTABLE / AGENT
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
// MODIFICATION
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


router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
    ),
    controller.remove
);


module.exports = router;