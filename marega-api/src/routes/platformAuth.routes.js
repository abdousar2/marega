const express = require("express");

const PlatformAuthController =
    require("../controllers/platformAuth.controller");

const {
    authenticatePlatformAdmin
} =
    require("../middleware/platformAdmin.middleware");


const router =
    express.Router();


/*
=========================================================
CONNEXION PLATFORM ADMIN
=========================================================
*/

router.post(
    "/login",
    PlatformAuthController.login
);


/*
=========================================================
ADMINISTRATEUR CONNECTÉ
=========================================================
*/

router.get(
    "/me",
    authenticatePlatformAdmin,
    PlatformAuthController.me
);


module.exports = router;