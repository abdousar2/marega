const Expense = require("../models/expense.model");

class ExpensesController {

    static async getAll(req, res) {

        try {

            const expenses =
                await Expense.getAll();

            res.json(expenses);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors du chargement des dépenses."
            });

        }

    }

    static async getById(req, res) {

        try {

            const expense =
                await Expense.getById(req.params.id);

            if (!expense) {

                return res.status(404).json({
                    error: "Dépense introuvable."
                });

            }

            res.json(expense);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors du chargement de la dépense."
            });

        }

    }

    static async create(req, res) {

        try {

            const expense =
                await Expense.create(req.body);

            const completeExpense =
                await Expense.getById(expense.id);

            res.status(201).json(completeExpense);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de l'enregistrement de la dépense."
            });

        }

    }

    static async update(req, res) {

        try {

            const expense =
                await Expense.update(
                    req.params.id,
                    req.body
                );

            if (!expense) {

                return res.status(404).json({
                    error: "Dépense introuvable."
                });

            }

            const completeExpense =
                await Expense.getById(expense.id);

            res.json(completeExpense);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de la mise à jour de la dépense."
            });

        }

    }

    static async remove(req, res) {

        try {

            await Expense.delete(req.params.id);

            res.json({
                success: true
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de la suppression de la dépense."
            });

        }

    }

}

module.exports = ExpensesController;