const express = require("express");

const router = express.Router();

const PaymentsController =
    require("../controllers/payments.controller");

router.get(
    "/",
    PaymentsController.getAll
);

router.get(
    "/:id",
    PaymentsController.getById
);

router.post(
    "/",
    PaymentsController.create
);

router.put(
    "/:id",
    PaymentsController.update
);

router.delete(
    "/:id",
    PaymentsController.remove
);

module.exports = router;