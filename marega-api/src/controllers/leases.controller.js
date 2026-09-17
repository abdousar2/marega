const Lease =
    require("../models/lease.model");

const Rent =
    require("../models/rent.model");

const PDFService =
    require("../services/pdf.service");

const AuditService =
    require("../services/audit.service");


class LeasesController {


    // =========================================================
    // LISTE
    // =========================================================

    static async getAll(req, res) {

        try {

            const agencyId =
                req.user.agency_id;


            const leases =
                await Lease.getAll(
                    agencyId
                );


            res.json(leases);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur lors du chargement des contrats."

            });

        }

    }


    // =========================================================
    // DÉTAIL
    // =========================================================

    static async getById(req, res) {

        try {

            const agencyId =
                req.user.agency_id;


            const lease =
                await Lease.getById(

                    req.params.id,

                    agencyId

                );


            if (!lease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            res.json(lease);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur lors du chargement du contrat."

            });

        }

    }


    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(req, res) {

        try {

            const agencyId =
                req.user.agency_id;


            // -------------------------------------------------
            // CRÉATION
            // -------------------------------------------------

            const lease =
                await Lease.create(

                    req.body,

                    agencyId

                );


            // -------------------------------------------------
            // CONTRAT COMPLET
            // -------------------------------------------------

            const completeLease =
                await Lease.getCompleteById(

                    lease.id,

                    agencyId

                );


            console.log(
                "LEASE COMPLET"
            );

            console.log(
                completeLease
            );


            // -------------------------------------------------
            // PDF
            // -------------------------------------------------

            const pdfPath =
                await PDFService.generateLeasePDF(
                    completeLease
                );


            // -------------------------------------------------
            // SAUVEGARDE PDF
            // -------------------------------------------------

            await Lease.updatePdfPath(

                lease.id,

                pdfPath,

                agencyId

            );


            // -------------------------------------------------
            // GÉNÉRATION DES LOYERS
            // -------------------------------------------------

            await Rent.generateFromLease({

                ...lease,

                monthly_rent:
                    lease.monthly_rent

            });


            // -------------------------------------------------
            // RECHARGEMENT
            // -------------------------------------------------

            const finalLease =
                await Lease.getCompleteById(

                    lease.id,

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
                        "leases",

                    entity_id:
                        finalLease.id,

                    details: {

                        contract_number:
                            finalLease.contract_number,

                        tenant_id:
                            finalLease.tenant_id,

                        apartment_id:
                            finalLease.apartment_id

                    }

                }
            );


            res.status(201).json(
                finalLease
            );

        }

        catch (err) {

            console.error(
                "Erreur création lease :",
                err
            );


            if (
                err.code ===
                "AGENCY_MISMATCH"
            ) {

                return res.status(403).json({

                    error:
                        err.message

                });

            }


            res.status(500).json({

                error:
                    "Erreur lors de la création du contrat."

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
            // EXISTENCE DANS L'AGENCE
            // -------------------------------------------------

            const existingLease =
                await Lease.getById(

                    id,

                    agencyId

                );


            if (!existingLease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            // -------------------------------------------------
            // MODIFICATION
            // -------------------------------------------------

            const lease =
                await Lease.update(

                    id,

                    req.body,

                    agencyId

                );


            if (!lease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            // -------------------------------------------------
            // LOYERS
            // -------------------------------------------------

            await Rent.syncUnpaidFromLease(
                lease,
                agencyId
            );


            // -------------------------------------------------
            // CONTRAT COMPLET
            // -------------------------------------------------

            const completeLease =
                await Lease.getCompleteById(

                    id,

                    agencyId

                );


            // -------------------------------------------------
            // PDF
            // -------------------------------------------------

            const pdfPath =
                await PDFService.generateLeasePDF(
                    completeLease
                );


            await Lease.updatePdfPath(

                id,

                pdfPath,

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


            // -------------------------------------------------
            // FINAL
            // -------------------------------------------------

            const finalLease =
                await Lease.getCompleteById(

                    id,

                    agencyId

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


            if (
                err.code ===
                "AGENCY_MISMATCH"
            ) {

                return res.status(403).json({

                    error:
                        err.message

                });

            }


            res.status(500).json({

                error:
                    "Erreur lors de la mise à jour du contrat."

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


            const agencyId =
                req.user.agency_id;


            const lease =
                await Lease.getById(

                    id,

                    agencyId

                );


            if (!lease) {

                return res.status(404).json({

                    error:
                        "Contrat introuvable."

                });

            }


            // -------------------------------------------------
            // PAIEMENTS
            // -------------------------------------------------

            const hasPayments =
                await Rent.hasPayments(
                    id,
                    agencyId
                );


            if (hasPayments) {

                return res.status(409).json({

                    error:
                        "Impossible de supprimer ce contrat : des paiements sont associés à ses loyers. L'historique financier doit être conservé."

                });

            }


            // -------------------------------------------------
            // SUPPRESSION
            // -------------------------------------------------

            await Lease.delete(

                id,

                agencyId

            );


            // -------------------------------------------------
            // AUDIT
            // -------------------------------------------------

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


            res.json({

                success:
                    true,

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


module.exports =
    LeasesController;