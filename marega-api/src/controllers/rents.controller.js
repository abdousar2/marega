const Rent = require("../models/rent.model");

class RentsController {

    static async getAll(req, res) {

        try {

            const rents = await Rent.getAll();

            res.json(rents);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Impossible de récupérer les loyers."
            });

        }

    }

    static async getPending(req, res) {

        try {

            const rents = await Rent.getPending();

            res.json(rents);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Impossible de récupérer les loyers en attente."
            });

        }

    }

    static async getLate(req, res) {

        try {

            const rents = await Rent.getLate();

            res.json(rents);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Impossible de récupérer les loyers en retard."
            });

        }

    }

    static async create(req, res) {

        try {

            const rent = await Rent.create(req.body);

            res.status(201).json(rent);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                error: "Impossible de créer le loyer."
            });

        }

    }

    static async getById(req, res) {

        try {

            const rent =
                await Rent.getById(req.params.id);

            if (!rent) {

                return res.status(404).json({

                    error: "Échéance introuvable."

                });

            }

            res.json(rent);

        }

        catch(err){

            console.error(err);

            res.status(500).json({

                error:"Erreur serveur."

            });

        }

    }

}

module.exports = RentsController;