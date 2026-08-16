const express = require("express");

const router = express.Router();

const RentsController =
    require("../controllers/rents.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// CONSULTATION
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
    RentsController.getAll
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
    RentsController.getById
);

router.get(
    "/pending",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE",
        "AGENT"
    ),
    RentsController.getPending
);

router.get(
    "/late",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE",
        "AGENT"
    ),
    RentsController.getLate
);


// =========================================================
// CRÉATION
// ADMIN / RESPONSABLE / COMPTABLE
// =========================================================

// router.post(
//    "/",
//    authenticateToken,
//    authorizeRoles(
//        "ADMIN",
//        "RESPONSABLE",
//        "COMPTABLE"
//    ),
//    RentsController.create
//);


module.exports = router;