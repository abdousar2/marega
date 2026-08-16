const Expense = require("../models/expense.model");
const AuditService = require("../services/audit.service");


class ExpensesController {

    // =========================================================
    // LECTURE
    // =========================================================

    static async getAll(req, res) {

        try {

            const expenses =
                await Expense.getAll();

            res.json(expenses);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur lors du chargement des dépenses."

            });

        }

    }


    static async getById(req, res) {

        try {

            const expense =
                await Expense.getById(
                    req.params.id
                );


            if (!expense) {

                return res.status(404).json({

                    error:
                        "Dépense introuvable."

                });

            }


            res.json(expense);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur lors du chargement de la dépense."

            });

        }

    }


    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(req, res) {

        try {

            const expense =
                await Expense.create(
                    req.body
                );


            const completeExpense =
                await Expense.getById(
                    expense.id
                );


            // -------------------------------------------------
            // AUDIT
            // -------------------------------------------------

            await AuditService.log(

                req,

                {

                    action:
                        "CREATE",

                    module:
                        "expenses",

                    entity_id:
                        expense.id,

                    details: {

                        expense_date:
                            expense.expense_date,

                        label:
                            expense.label,

                        category:
                            expense.category,

                        amount:
                            expense.amount,

                        payment_method:
                            expense.payment_method,

                        beneficiary:
                            expense.beneficiary,

                        reference:
                            expense.reference,

                        building_id:
                            expense.building_id,

                        apartment_id:
                            expense.apartment_id

                    }

                }

            );


            res.status(201).json(
                completeExpense
            );

        }

        catch (err) {

            console.error(
                "Erreur création dépense :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de l'enregistrement de la dépense."

            });

        }

    }


    // =========================================================
    // MODIFICATION
    // =========================================================

    static async update(req, res) {

        try {

            const id =
                Number(req.params.id);


            // -------------------------------------------------
            // VÉRIFIER QUE LA DÉPENSE EXISTE
            // -------------------------------------------------

            const existingExpense =
                await Expense.getById(
                    id
                );


            if (!existingExpense) {

                return res.status(404).json({

                    error:
                        "Dépense introuvable."

                });

            }


            // -------------------------------------------------
            // MODIFICATION
            // -------------------------------------------------

            const expense =
                await Expense.update(

                    id,

                    req.body

                );


            if (!expense) {

                return res.status(404).json({

                    error:
                        "Dépense introuvable."

                });

            }


            const completeExpense =
                await Expense.getById(
                    id
                );


            // -------------------------------------------------
            // AUDIT
            // -------------------------------------------------

            await AuditService.log(

                req,

                {

                    action:
                        "UPDATE",

                    module:
                        "expenses",

                    entity_id:
                        id,

                    details: {

                        before: {

                            expense_date:
                                existingExpense.expense_date,

                            label:
                                existingExpense.label,

                            category:
                                existingExpense.category,

                            amount:
                                existingExpense.amount,

                            payment_method:
                                existingExpense.payment_method,

                            beneficiary:
                                existingExpense.beneficiary,

                            reference:
                                existingExpense.reference,

                            description:
                                existingExpense.description,

                            building_id:
                                existingExpense.building_id,

                            apartment_id:
                                existingExpense.apartment_id

                        },

                        after: {

                            expense_date:
                                expense.expense_date,

                            label:
                                expense.label,

                            category:
                                expense.category,

                            amount:
                                expense.amount,

                            payment_method:
                                expense.payment_method,

                            beneficiary:
                                expense.beneficiary,

                            reference:
                                expense.reference,

                            description:
                                expense.description,

                            building_id:
                                expense.building_id,

                            apartment_id:
                                expense.apartment_id

                        }

                    }

                }

            );


            res.json(
                completeExpense
            );

        }

        catch (err) {

            console.error(
                "Erreur modification dépense :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de la mise à jour de la dépense."

            });

        }

    }


    // =========================================================
    // SUPPRESSION
    // =========================================================

    static async remove(req, res) {

        try {

            const id =
                Number(req.params.id);


            // -------------------------------------------------
            // VÉRIFIER QUE LA DÉPENSE EXISTE
            // -------------------------------------------------

            const expense =
                await Expense.getById(
                    id
                );


            if (!expense) {

                return res.status(404).json({

                    error:
                        "Dépense introuvable."

                });

            }


            // -------------------------------------------------
            // AUDIT DE LA TENTATIVE
            // -------------------------------------------------

            await AuditService.log(

                req,

                {

                    action:
                        "DELETE_ATTEMPT",

                    module:
                        "expenses",

                    entity_id:
                        id,

                    details: {

                        expense_date:
                            expense.expense_date,

                        label:
                            expense.label,

                        category:
                            expense.category,

                        amount:
                            expense.amount,

                        payment_method:
                            expense.payment_method,

                        beneficiary:
                            expense.beneficiary,

                        reference:
                            expense.reference,

                        description:
                            expense.description,

                        building_id:
                            expense.building_id,

                        apartment_id:
                            expense.apartment_id

                    }

                }

            );


            // -------------------------------------------------
            // SUPPRESSION
            // -------------------------------------------------

            await Expense.delete(
                id
            );


            // -------------------------------------------------
            // AUDIT DE LA SUPPRESSION
            // -------------------------------------------------

            await AuditService.log(

                req,

                {

                    action:
                        "DELETE",

                    module:
                        "expenses",

                    entity_id:
                        id,

                    details: {

                        expense_date:
                            expense.expense_date,

                        label:
                            expense.label,

                        category:
                            expense.category,

                        amount:
                            expense.amount,

                        payment_method:
                            expense.payment_method,

                        beneficiary:
                            expense.beneficiary,

                        reference:
                            expense.reference,

                        description:
                            expense.description,

                        building_id:
                            expense.building_id,

                        apartment_id:
                            expense.apartment_id

                    }

                }

            );


            res.json({

                success: true,

                message:
                    "Dépense supprimée."

            });

        }

        catch (err) {

            console.error(
                "Erreur suppression dépense :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de la suppression de la dépense."

            });

        }

    }

}


module.exports = ExpensesController;