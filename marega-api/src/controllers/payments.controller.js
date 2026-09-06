const db = require("../config/database");

const Payment = require("../models/payments.model");
const Rent = require("../models/rent.model");
const ReceiptService = require("../services/receipt.service");
const AuditService = require("../services/audit.service");

class PaymentsController {

    // =========================================================
    // LECTURE
    // =========================================================

    static async getAll(req, res) {

        try {

            const payments =
            await Payment.getAll(
                req.user.agency_id
            );

            res.json(payments);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error:
                    "Erreur lors du chargement des paiements."
            });

        }

    }

    static async getById(req, res) {

        try {

            const payment =
            await Payment.getCompleteById(

                req.params.id,

                req.user.agency_id

            );


            if (!payment) {

                return res.status(404).json({
                    error:
                        "Paiement introuvable."
                });

            }


            res.json(payment);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error:
                    "Erreur lors du chargement du paiement."
            });

        }

    }

    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(req, res) {

        let client;

        try {

            const agencyId =
                req.user.agency_id;


            // -------------------------------------------------
            // VÉRIFICATION DES RELATIONS
            // -------------------------------------------------

            const validRelations =
                await Payment.validateAgencyRelations(

                    agencyId,

                    req.body.tenant_id,

                    req.body.lease_id,

                    req.body.rent_id || null

                );


            if (!validRelations) {

                return res.status(403).json({

                    error:
                        "Les données sélectionnées n'appartiennent pas à votre agence."

                });

            }


            // -------------------------------------------------
            // SI UN LOYER EST SÉLECTIONNÉ
            // VÉRIFIER SON ÉTAT AVANT LA TRANSACTION
            // -------------------------------------------------

            if (req.body.rent_id) {

                const rent =
                    await Rent.getByIdForPayment(

                        req.body.rent_id,

                        agencyId

                    );


                if (!rent) {

                    return res.status(404).json({

                        error:
                            "Loyer introuvable dans votre agence."

                    });

                }


                if (
                    rent.status === "Payé" ||
                    rent.payment_id !== null
                ) {

                    return res.status(409).json({

                        error:
                            "Ce loyer a déjà été encaissé. Il ne peut pas être payé une seconde fois."

                    });

                }

            }


            // -------------------------------------------------
            // IDENTITÉ DU COMPTABLE
            // -------------------------------------------------

            const paymentData = {

                ...req.body,

                agency_id:
                    agencyId,

                cashier_user_id:
                    req.user.id

            };


            // -------------------------------------------------
            // OUVRIR UNE TRANSACTION
            // -------------------------------------------------

            client =
                await db.connect();


            await client.query("BEGIN");


            // -------------------------------------------------
            // CRÉER LE PAIEMENT
            // -------------------------------------------------

            const payment =
                await Payment.create(

                    paymentData,

                    client

                );


            // -------------------------------------------------
            // MARQUER LE LOYER COMME PAYÉ
            // -------------------------------------------------

            if (req.body.rent_id) {

                const updatedRent =
                    await Rent.markAsPaid(

                        req.body.rent_id,

                        payment.id,

                        agencyId,

                        client

                    );


                if (!updatedRent) {

                    throw new Error(

                        "Le loyer sélectionné a déjà été encaissé ou n'est plus disponible."

                    );

                }

            }


            // -------------------------------------------------
            // VALIDER LA TRANSACTION
            // -------------------------------------------------

            await client.query("COMMIT");


            // -------------------------------------------------
            // LIBÉRER LE CLIENT
            // -------------------------------------------------

            client.release();

            client = null;


            // -------------------------------------------------
            // RÉCUPÉRER LE PAIEMENT COMPLET
            // -------------------------------------------------

            const completePayment =
                await Payment.getCompleteById(

                    payment.id,

                    agencyId

                );


            if (!completePayment) {

                throw new Error(

                    "Paiement créé mais impossible de récupérer ses données complètes."

                );

            }


            // -------------------------------------------------
            // GÉNÉRER LE REÇU
            // -------------------------------------------------

            const receiptPath =
                await ReceiptService.generateReceipt(

                    completePayment

                );


            // -------------------------------------------------
            // SAUVEGARDER LE CHEMIN DU REÇU
            // -------------------------------------------------

            await Payment.updateReceiptPath(

                payment.id,

                receiptPath,

                agencyId

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
                        "payments",

                    entity_id:
                        payment.id,

                    details: {

                        tenant_id:
                            payment.tenant_id,

                        lease_id:
                            payment.lease_id,

                        rent_id:
                            req.body.rent_id || null,

                        payment_month:
                            payment.payment_month,

                        amount:
                            payment.amount,

                        payment_date:
                            payment.payment_date,

                        payment_method:
                            payment.payment_method,

                        reference:
                            payment.reference,

                        status:
                            payment.status,

                        cashier_user_id:
                            payment.cashier_user_id

                    }

                }

            );


            // -------------------------------------------------
            // PAIEMENT FINAL
            // -------------------------------------------------

            const finalPayment =
                await Payment.getCompleteById(

                    payment.id,

                    agencyId

                );


            res.status(201).json(

                finalPayment

            );

        }

        catch (err) {

            // -------------------------------------------------
            // ROLLBACK SI TRANSACTION ACTIVE
            // -------------------------------------------------

            if (client) {

                try {

                    await client.query("ROLLBACK");

                }

                catch (rollbackError) {

                    console.error(
                        "Erreur ROLLBACK :",
                        rollbackError
                    );

                }

                client.release();

            }


            console.error(

                "Erreur création paiement :",

                err

            );


            res.status(500).json({

                error:
                    "Erreur lors de l'enregistrement du paiement."

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

            const agencyId =
                req.user.agency_id;


            // -------------------------------------------------
            // VÉRIFIER QUE LE PAIEMENT EXISTE
            // -------------------------------------------------

            const existingPayment =
                await Payment.getById(

                    id,

                    req.user.agency_id

                );


            if (!existingPayment) {

                return res.status(404).json({

                    error:
                        "Paiement introuvable."

                });

            }


            // -------------------------------------------------
            // PAIEMENT DÉJÀ ENCAISSÉ
            // -------------------------------------------------

            if (existingPayment.status === "Payé") {

                // =============================================
                // CHAMPS FINANCIERS / STRUCTURELS INTERDITS
                // =============================================

                const protectedFields = [

                    "tenant_id",
                    "lease_id",
                    "payment_month",
                    "amount",
                    "status"

                ];


                const attemptedProtectedFields =
                    protectedFields.filter(
                        field =>
                            Object.prototype.hasOwnProperty.call(
                                req.body,
                                field
                            )
                    );


                if (
                    attemptedProtectedFields.length > 0
                ) {

                    await AuditService.log(

                        req,

                        {

                            action:
                                "UPDATE_ATTEMPT",

                            module:
                                "payments",

                            entity_id:
                                id,

                            details: {

                                protected_fields:
                                    attemptedProtectedFields,

                                reason:
                                    "Modification interdite d'un paiement déjà encaissé."

                            }

                        }

                    );


                    return res.status(409).json({

                        error:
                            "Impossible de modifier les informations financières d'un paiement déjà encaissé. L'historique financier doit être conservé."

                    });

                }

            }


            // -------------------------------------------------
            // CONSTRUIRE LES DONNÉES DE MODIFICATION
            // -------------------------------------------------

            const paymentData = {

                tenant_id:
                    existingPayment.tenant_id,

                lease_id:
                    existingPayment.lease_id,

                payment_month:
                    existingPayment.payment_month,

                amount:
                    existingPayment.amount,

                payment_date:
                    req.body.payment_date ??
                    existingPayment.payment_date,

                payment_method:
                    req.body.payment_method ??
                    existingPayment.payment_method,

                reference:
                    req.body.reference ??
                    existingPayment.reference,

                status:
                    existingPayment.status,

                notes:
                    req.body.notes ??
                    existingPayment.notes

            };


            // -------------------------------------------------
            // MODIFICATION
            // -------------------------------------------------

            const payment =
                await Payment.update(

                    id,

                    paymentData,

                    req.user.agency_id

                );


            if (!payment) {

                return res.status(404).json({

                    error:
                        "Paiement introuvable."

                });

            }


            // -------------------------------------------------
            // RÉCUPÉRER LE PAIEMENT COMPLET
            // -------------------------------------------------

            const completePayment =
                await Payment.getCompleteById(

                    id,

                    req.user.agency_id

                );


            // -------------------------------------------------
            // RÉGÉNÉRER LA QUITTANCE
            // -------------------------------------------------

            const receiptPath =
                await ReceiptService.generateReceipt(
                    completePayment
                );


            await Payment.updateReceiptPath(

                payment.id,

                receiptPath,

                agencyId

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
                        "payments",

                    entity_id:
                        id,

                    details: {

                        before: {

                            tenant_id:
                                existingPayment.tenant_id,

                            lease_id:
                                existingPayment.lease_id,

                            payment_month:
                                existingPayment.payment_month,

                            amount:
                                existingPayment.amount,

                            payment_date:
                                existingPayment.payment_date,

                            payment_method:
                                existingPayment.payment_method,

                            reference:
                                existingPayment.reference,

                            status:
                                existingPayment.status

                        },

                        after: {

                            tenant_id:
                                payment.tenant_id,

                            lease_id:
                                payment.lease_id,

                            payment_month:
                                payment.payment_month,

                            amount:
                                payment.amount,

                            payment_date:
                                payment.payment_date,

                            payment_method:
                                payment.payment_method,

                            reference:
                                payment.reference,

                            status:
                                payment.status

                        }

                    }

                }

            );


            // -------------------------------------------------
            // PAIEMENT FINAL
            // -------------------------------------------------

            const finalPayment =
                await Payment.getCompleteById(

                    id,

                    req.user.agency_id

                );


            res.json(
                finalPayment
            );

        }

        catch (err) {

            console.error(
                "Erreur modification paiement :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de la mise à jour du paiement."

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
            // VÉRIFIER QUE LE PAIEMENT EXISTE
            // -------------------------------------------------

            const payment =
                await Payment.getById(

                    id,

                    req.user.agency_id

                );


            if (!payment) {

                return res.status(404).json({

                    error:
                        "Paiement introuvable."

                });

            }


            // -------------------------------------------------
            // AUDITER LA TENTATIVE
            // -------------------------------------------------

            await AuditService.log(

                req,

                {

                    action:
                        "DELETE_ATTEMPT",

                    module:
                        "payments",

                    entity_id:
                        id,

                    details: {

                        tenant_id:
                            payment.tenant_id,

                        lease_id:
                            payment.lease_id,

                        payment_month:
                            payment.payment_month,

                        amount:
                            payment.amount,

                        payment_date:
                            payment.payment_date,

                        payment_method:
                            payment.payment_method,

                        reference:
                            payment.reference,

                        status:
                            payment.status,

                        reason:
                            "Les paiements font partie de l'historique financier et ne peuvent pas être supprimés."

                    }

                }

            );


            // -------------------------------------------------
            // SUPPRESSION INTERDITE
            // -------------------------------------------------

            return res.status(409).json({

                error:
                    "Impossible de supprimer ce paiement : l'historique financier doit être conservé."

            });

        }

        catch (err) {

            console.error(
                "Erreur suppression paiement :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de la suppression du paiement."

            });

        }

    }

}


module.exports = PaymentsController;