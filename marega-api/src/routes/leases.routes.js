const express = require("express");
const router = express.Router();

const LeasesController = require("../controllers/leases.controller");

router.get("/", LeasesController.getAll);

router.get("/:id", LeasesController.getById);

router.post("/", LeasesController.create);

router.put("/:id", LeasesController.update);

router.delete("/:id", LeasesController.remove);

module.exports = router;