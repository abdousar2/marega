const Rent = require("../models/rent.model");

class RentsController {

    // =========================================================
    // TOUS LES LOYERS DE L'AGENCE CONNECTÉE
    // =========================================================

    static async getAll(req, res) {

        try {

            const agencyId =
                req.user.agency_id;

            const rents =
                await Rent.getAll(agencyId);

            res.json(rents);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Impossible de récupérer les loyers."
            });

        }

    }


    // =========================================================
    // LOYERS EN ATTENTE DE L'AGENCE
    // =========================================================

    static async getPending(req, res) {

        try {

            const agencyId =
                req.user.agency_id;

            const rents =
                await Rent.getPending(agencyId);

            res.json(rents);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error:
                    "Impossible de récupérer les loyers en attente."
            });

        }

    }


    // =========================================================
    // LOYERS EN RETARD DE L'AGENCE
    // =========================================================

    static async getLate(req, res) {

        try {

            const agencyId =
                req.user.agency_id;

            const rents =
                await Rent.getLate(agencyId);

            res.json(rents);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error:
                    "Impossible de récupérer les loyers en retard."
            });

        }

    }


    // =========================================================
    // CRÉATION MANUELLE
    // =========================================================

    static async create(req, res) {

        try {

            const agencyId =
                req.user.agency_id;


            const rent =
                await Rent.create({

                    ...req.body,

                    agency_id:
                        agencyId

                });


            res.status(201).json(rent);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error:
                    "Impossible de créer le loyer."
            });

        }

    }


    // =========================================================
    // UN LOYER DE L'AGENCE CONNECTÉE
    // =========================================================

    static async getById(req, res) {

        try {

            const agencyId =
                req.user.agency_id;


            const rent =
                await Rent.getById(

                    req.params.id,

                    agencyId

                );


            if (!rent) {

                return res.status(404).json({

                    error:
                        "Échéance introuvable."

                });

            }


            res.json(rent);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur serveur."

            });

        }

    }

}

module.exports = RentsController;