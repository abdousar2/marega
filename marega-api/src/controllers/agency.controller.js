const Agency = require("../models/agency.model");


class AgencyController {


    static async getAll(req, res) {

        try {

            const agencies =
                await Agency.getAll();

            res.json(agencies);

        }

        catch (err) {

            console.error(
                "Erreur chargement agences :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors du chargement des agences."

            });

        }

    }


    static async getById(req, res) {

        try {

            const agency =
                await Agency.getById(
                    Number(req.params.id)
                );


            if (!agency) {

                return res.status(404).json({

                    error:
                        "Agence introuvable."

                });

            }


            res.json(agency);

        }

        catch (err) {

            console.error(
                "Erreur chargement agence :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors du chargement de l'agence."

            });

        }

    }

}


module.exports = AgencyController;