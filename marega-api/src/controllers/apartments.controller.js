const Apartment = require("../models/apartments.model");

async function getAll(req, res) {

    try {

        const apartments = await Apartment.getAll();

        res.json(apartments);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function getById(req, res) {

    try {

        const apartment = await Apartment.getById(req.params.id);

        if (!apartment) {

            return res.status(404).json({
                message: "Appartement introuvable."
            });

        }

        res.json(apartment);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function getByBuilding(req, res) {

    try {

        const apartments = await Apartment.getByBuilding(req.params.id);

        res.json(apartments);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function create(req, res) {

    try {

        const apartment = await Apartment.create(req.body);

        res.status(201).json(apartment);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function update(req, res) {

    try {

        const apartment = await Apartment.update(
            req.params.id,
            req.body
        );

        if (!apartment) {

            return res.status(404).json({
                message: "Appartement introuvable."
            });

        }

        res.json(apartment);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function remove(req, res) {

    try {

        await Apartment.remove(req.params.id);

        res.json({
            message: "Appartement supprimé."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

module.exports = {

    getAll,
    getById,
    getByBuilding,
    create,
    update,
    remove

};