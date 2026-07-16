const Payment = require("../models/payments.model");
const Rent = require("../models/rent.model");
const ReceiptService = require("../services/receipt.service");

class PaymentsController {

    static async getAll(req, res) {

        try {

            const payments = await Payment.getAll();

            res.json(payments);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors du chargement des paiements."
            });

        }

    }

    static async getById(req, res) {

        try {

            const payment = await Payment.getById(req.params.id);

            if (!payment) {

                return res.status(404).json({
                    error: "Paiement introuvable."
                });

            }

            res.json(payment);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors du chargement du paiement."
            });

        }

    }

    static async create(req, res) {

        try {

            const payment =
                await Payment.create(req.body);

            if (req.body.rent_id) {

                await Rent.markAsPaid(

                    req.body.rent_id,

                    payment.id

                );

            }

            const completePayment =
                await Payment.getCompleteById(payment.id);

            const receiptPath =
                await ReceiptService.generateReceipt(
                    completePayment
                );

            await Payment.updateReceiptPath(

                payment.id,

                receiptPath

            );

            const finalPayment =
                await Payment.getCompleteById(payment.id);

            res.status(201).json(finalPayment);

        }

        catch(err){

            console.error(err);

            res.status(500).json({

                error:"Erreur lors de l'enregistrement du paiement."

            });

        }

    }

    static async update(req, res) {

        try {

            const payment = await Payment.update(
                req.params.id,
                req.body
            );

            if (!payment) {

                return res.status(404).json({
                    error: "Paiement introuvable."
                });

            }

            res.json(payment);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de la mise à jour."
            });

        }

    }

    static async remove(req, res) {

        try {

            await Payment.delete(req.params.id);

            res.json({
                success: true
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de la suppression."
            });

        }

    }

}

module.exports = PaymentsController;