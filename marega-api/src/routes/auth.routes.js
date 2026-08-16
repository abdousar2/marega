const express = require("express");

const AuthController =
    require("../controllers/auth.controller");

const {
    authenticateToken
} = require("../middleware/auth.middleware");


const router = express.Router();


// =========================================================
// CONNEXION
// =========================================================

router.post(
    "/login",
    AuthController.login
);


// =========================================================
// UTILISATEUR CONNECTÉ
// =========================================================

router.get(
    "/me",
    authenticateToken,
    AuthController.me
);


module.exports = router;