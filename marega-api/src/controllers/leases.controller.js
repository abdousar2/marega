const Lease = require("../models/lease.model");
const Rent = require("../models/rent.model");
const PDFService = require("../services/pdf.service");
const AuditService = require("../services/audit.service");


class LeasesController {

    static async getAll(req, res) {

        try {

            const leases = await Lease.getAll();

            res.json(leases);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors du chargement des contrats."
            });

        }

    }

    static async getById(req, res) {

        try {

            const lease = await Lease.getById(req.params.id);

            if (!lease) {

                return res.status(404).json({
                    error: "Contrat introuvable."
                });

            }

            res.json(lease);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors du chargement du contrat."
            });

        }

    }

    static async create(req, res) {

        try {

            // Création du contrat
            const lease = await Lease.create(req.body);

            // Contrat enrichi
            const completeLease =
                await Lease.getCompleteById(lease.id);

            console.log("LEASE COMPLET");
            console.log(completeLease);

            // Génération du PDF
            console.log("Avant generateLeasePDF");
           const pdfPath =
                await PDFService.generateLeasePDF(
                    completeLease
                );

            console.log("Après generateLeasePDF");


            // Sauvegarde du chemin
            await Lease.updatePdfPath(
                lease.id,
                pdfPath
            );

            await Rent.generateFromLease({
                ...lease,
                monthly_rent: lease.monthly_rent
            });

            // Recharge le contrat avec pdf_path
            const finalLease =
                await Lease.getCompleteById(
                    lease.id
                );


            await AuditService.log(req, {

                action: "CREATE",

                module: "leases",

                entity_id:
                    finalLease.id

            });


            res.status(201).json(finalLease);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur lors de la création du contrat."

            });

        }

    }

        static async update(req, res) {

        try {

            const id =
                Number(req.params.id);


            // =================================================
            // VÉRIFIER QUE LE CONTRAT EXISTE
            // =================================================

            const existingLease =
                await Lease.getById(id);


            if (!existingLease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            // =================================================
            // MODIFICATION DU CONTRAT
            // =================================================

            const lease =
                await Lease.update(
                    id,
                    req.body
                );


            if (!lease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            // =================================================
            // SYNCHRONISATION DES LOYERS NON PAYÉS
            // =================================================

            await Rent.syncUnpaidFromLease(
                lease
            );


            // =================================================
            // RÉCUPÉRATION DU CONTRAT COMPLET
            // =================================================

            const completeLease =
                await Lease.getCompleteById(
                    id
                );


            // =================================================
            // RÉGÉNÉRATION DU PDF
            // =================================================

            const pdfPath =
                await PDFService.generateLeasePDF(
                    completeLease
                );


            // =================================================
            // MISE À JOUR DU CHEMIN PDF
            // =================================================

            await Lease.updatePdfPath(
                id,
                pdfPath
            );


            // =================================================
            // AUDIT
            // =================================================

            await AuditService.log(

                req,

                {

                    action:
                        "UPDATE",

                    module:
                        "leases",

                    entity_id:
                        id,

                    details: {

                        contract_number:
                            lease.contract_number,

                        tenant_id:
                            lease.tenant_id,

                        apartment_id:
                            lease.apartment_id,

                        monthly_rent:
                            lease.monthly_rent,

                        start_date:
                            lease.start_date,

                        end_date:
                            lease.end_date,

                        status:
                            lease.status

                    }

                }

            );


            // =================================================
            // CONTRAT FINAL
            // =================================================

            const finalLease =
                await Lease.getCompleteById(
                    id
                );


            res.json(
                finalLease
            );

        }

        catch (err) {

            console.error(
                "Erreur update lease :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de la mise à jour du contrat."

            });

        }

    }

    static async remove(req, res) {

        try {

            const id =
                Number(req.params.id);


            // =====================================================
            // VÉRIFIER QUE LE CONTRAT EXISTE
            // =====================================================

            const lease =
                await Lease.getById(id);


            if (!lease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            // =====================================================
            // VÉRIFIER LES PAIEMENTS ASSOCIÉS
            // =====================================================

            const hasPayments =
                await Rent.hasPayments(id);


            if (hasPayments) {

                return res.status(409).json({

                    error:
                        "Impossible de supprimer ce contrat : des paiements sont associés à ses loyers. L'historique financier doit être conservé."

                });

            }


            // =====================================================
            // SUPPRESSION
            // =====================================================

            await Lease.delete(id);


            // =====================================================
            // AUDIT
            // =====================================================

            await AuditService.log(

                req,

                {

                    action:
                        "DELETE",

                    module:
                        "leases",

                    entity_id:
                        id,

                    details: {

                        contract_number:
                            lease.contract_number,

                        tenant_id:
                            lease.tenant_id,

                        apartment_id:
                            lease.apartment_id

                    }

                }

            );


            // =====================================================
            // RÉPONSE
            // =====================================================

            res.json({

                success: true,

                message:
                    "Contrat supprimé."

            });

        }

        catch (err) {

            console.error(
                "Erreur suppression contrat :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors de la suppression du contrat."

            });

        }

    }

}

module.exports = LeasesController;