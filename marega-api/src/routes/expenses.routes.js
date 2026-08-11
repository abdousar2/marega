const express = require("express");

const router = express.Router();

const ExpensesController =
    require("../controllers/expenses.controller");

router.get(
    "/",
    ExpensesController.getAll
);

router.get(
    "/:id",
    ExpensesController.getById
);

router.post(
    "/",
    ExpensesController.create
);

router.put(
    "/:id",
    ExpensesController.update
);

router.delete(
    "/:id",
    ExpensesController.remove
);

module.exports = router;