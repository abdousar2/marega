const express = require("express");

const router = express.Router();

const controller = require("../controllers/apartments.controller");

// Tous les appartements
router.get("/", controller.getAll);

// Tous les appartements d'un immeuble
router.get("/building/:id", controller.getByBuilding);

// Un appartement
router.get("/:id", controller.getById);

// Création
router.post("/", controller.create);

// Modification
router.put("/:id", controller.update);

// Suppression
router.delete("/:id", controller.remove);

module.exports = router;