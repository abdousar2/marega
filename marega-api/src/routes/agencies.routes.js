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
    authenticateToken
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
// AGENCE PAR ID
// =========================================================

router.get(

    "/:id",

    AgencyController.getById

);


// =========================================================
// DOCUMENTS DE L'AGENCE CONNECTÉE
// =========================================================

router.post(

    "/documents",

    authenticateToken,

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