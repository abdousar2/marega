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


// Tous les loyers de l'agence

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


// Loyers en attente

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


// Loyers en retard

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


// Un loyer

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


// =========================================================
// CRÉATION
// ADMIN / RESPONSABLE / COMPTABLE
// =========================================================

// Pour le moment désactivé car les loyers
// sont principalement générés depuis les contrats.

// router.post(
//
//     "/",
//
//     authenticateToken,
//
//     authorizeRoles(
//         "ADMIN",
//         "RESPONSABLE",
//         "COMPTABLE"
//     ),
//
//     RentsController.create
//
// );


module.exports = router;