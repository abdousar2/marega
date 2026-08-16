const express = require("express");

const router = express.Router();

const ExpensesController =
    require("../controllers/expenses.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// CONSULTATION
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
    ExpensesController.getAll
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
    ExpensesController.getById
);


// =========================================================
// CRÉATION / MODIFICATION
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
    ExpensesController.create
);


router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE"
    ),
    ExpensesController.update
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
    ExpensesController.remove
);


module.exports = router;