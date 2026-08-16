const express = require("express");

const router = express.Router();

const PaymentsController =
    require("../controllers/payments.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// LECTURE
// ADMIN / COMPTABLE / AGENT
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
    PaymentsController.getAll
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
    PaymentsController.getById
);


// =========================================================
// ENREGISTREMENT / MODIFICATION
// ADMIN / COMPTABLE
// =========================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE"
    ),
    PaymentsController.create
);


router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE"
    ),
    PaymentsController.update
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
    PaymentsController.remove
);


module.exports = router;