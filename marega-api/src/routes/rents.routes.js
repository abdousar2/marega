const express = require("express");

const router = express.Router();

const RentsController = require("../controllers/rents.controller");

router.get("/", RentsController.getAll);

router.get("/:id", RentsController.getById);

router.get("/pending", RentsController.getPending);

router.get("/late", RentsController.getLate);

router.post("/", RentsController.create);

module.exports = router;