const express = require("express");

const router = express.Router();

const AgencyController =
    require("../controllers/agency.controller");


router.get(
    "/",
    AgencyController.getAll
);


router.get(
    "/:id",
    AgencyController.getById
);


module.exports = router;