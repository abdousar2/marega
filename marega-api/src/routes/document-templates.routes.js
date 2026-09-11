const express = require("express");

const router =
    express.Router();

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");

const upload =
    require("../middleware/document-template-upload.middleware");

const DocumentTemplateController =
    require("../controllers/document-template.controller");

const TemplateRendererController =
    require("../controllers/template-renderer.controller");


// =========================================================
// ANALYSE
// =========================================================

router.post(
    "/normalize",
    authenticateToken,
    authorizeRoles("PLATFORM_ADMIN"),
    upload.single("document"),
    DocumentTemplateController.analyze
);


// =========================================================
// ENREGISTREMENT SQL
// =========================================================

router.post(
    "/save",
    authenticateToken,
    authorizeRoles("PLATFORM_ADMIN"),
    DocumentTemplateController.save
);

// =========================================================
// ANALYSER + ENREGISTRER AUTOMATIQUEMENT
// =========================================================

router.post(
    "/process",
    authenticateToken,
    authorizeRoles("PLATFORM_ADMIN"),
    upload.single("document"),
    DocumentTemplateController.process
);

router.post(
    "/render-lease",
    authenticateToken,
    authorizeRoles("PLATFORM_ADMIN"),
    TemplateRendererController.renderLease
);


module.exports = router;