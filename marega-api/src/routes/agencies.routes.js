const express = require("express");

const router = express.Router();


// =========================================================
// CONTROLLER
// =========================================================

const AgencyController =
    require("../controllers/agency.controller");


// =========================================================
// AUTHENTIFICATION
// =========================================================

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =========================================================
// UPLOAD
// =========================================================

const uploadAgencyDocuments =
    require("../middleware/agency-upload.middleware");


// =========================================================
// LISTE DES AGENCES
// =========================================================

router.get(

    "/",

    AgencyController.getAll

);

// =========================================================
// AGENCE CONNECTÉE
// =========================================================

router.get(
    "/me",
    authenticateToken,
    AgencyController.getById
);


// =========================================================
// PARAMÈTRES DE L'AGENCE
// ADMIN UNIQUEMENT
// =========================================================

router.put(
    "/settings",
    authenticateToken,
    authorizeRoles("ADMIN"),
    AgencyController.updateSettings
);


// =========================================================
// AGENCE PAR ID
// =========================================================

router.get(
    "/:id",
    authenticateToken,
    AgencyController.getById
);


// =========================================================
// DOCUMENTS DE L'AGENCE CONNECTÉE
// =========================================================

router.post(
    "/documents",

    authenticateToken,
    authorizeRoles("ADMIN"),

    uploadAgencyDocuments.fields([

        {
            name: "logo",
            maxCount: 1
        },

        {
            name: "contract",
            maxCount: 1
        },

        {
            name: "receipt",
            maxCount: 1
        }

    ]),

    AgencyController.uploadDocuments

);


module.exports = router;