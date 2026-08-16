const express = require("express");

const router = express.Router();

const AuditController =
    require("../controllers/audit.controller");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// JOURNAL D'AUDIT
// ADMIN UNIQUEMENT
// =========================================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN"
    ),
    AuditController.getAll
);


module.exports = router;