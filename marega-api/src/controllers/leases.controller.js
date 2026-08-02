const Lease = require("../models/lease.model");
const Rent = require("../models/rent.model");
const PDFService = require("../services/pdf.service");


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

            const lease = await Lease.update(
                req.params.id,
                req.body
            );

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
                error: "Erreur lors de la mise à jour du contrat."
            });

        }

    }

    static async remove(req, res) {

        try {

            await Lease.delete(req.params.id);

            res.json({
                success: true
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de la suppression du contrat."
            });

        }

    }

}

module.exports = LeasesController;