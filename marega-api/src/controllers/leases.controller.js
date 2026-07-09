const Lease = require("../models/lease.model");

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

            const lease = await Lease.create(req.body);

            res.status(201).json(lease);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Erreur lors de la création du contrat."
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