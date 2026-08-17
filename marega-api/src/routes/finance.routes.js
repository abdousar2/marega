const express = require("express");

const router = express.Router();

const FinanceController =
    require("../controllers/finance.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// RAPPORT FINANCIER
// ADMIN / RESPONSABLE / COMPTABLE
// =========================================================

router.get(
    "/report",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RESPONSABLE",
        "COMPTABLE"
    ),
    FinanceController.getReport
);


module.exports = router;