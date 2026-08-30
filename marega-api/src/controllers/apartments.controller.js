const Apartment =
    require("../models/apartments.model");

const AuditService =
    require("../services/audit.service");


// =========================================================
// TOUS LES APPARTEMENTS
// =========================================================

async function getAll(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const apartments =
            await Apartment.getAll(
                agencyId
            );


        res.json(apartments);

    }

    catch (err) {

        console.error(
            "APARTMENTS GET ALL ERROR:",
            err
        );

        res.status(500).json({

            message:
                "Erreur serveur."

        });

    }

}


// =========================================================
// UN APPARTEMENT
// =========================================================

async function getById(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const apartment =
            await Apartment.getById(

                req.params.id,

                agencyId

            );


        if (!apartment) {

            return res.status(404).json({

                message:
                    "Appartement introuvable."

            });

        }


        res.json(apartment);

    }

    catch (err) {

        console.error(
            "APARTMENT GET BY ID ERROR:",
            err
        );

        res.status(500).json({

            message:
                "Erreur serveur."

        });

    }

}


// =========================================================
// APPARTEMENTS D'UN IMMEUBLE
// =========================================================

async function getByBuilding(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const apartments =
            await Apartment.getByBuilding(

                req.params.id,

                agencyId

            );


        res.json(apartments);

    }

    catch (err) {

        console.error(
            "APARTMENTS GET BY BUILDING ERROR:",
            err
        );

        res.status(500).json({

            message:
                "Erreur serveur."

        });

    }

}


// =========================================================
// CRÉATION
// =========================================================

async function create(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const apartment =
            await Apartment.create(

                req.body,

                agencyId

            );


        await AuditService.log(req, {

            action: "CREATE",

            module: "apartments",

            entity_id:
                apartment.id,

            details: {

                agency_id:
                    agencyId,

                building_id:
                    apartment.building_id,

                number:
                    apartment.number

            }

        });


        res.status(201).json(
            apartment
        );

    }

    catch (err) {

        console.error(
            "APARTMENT CREATE ERROR:",
            err
        );


        if (
            err.message ===
            "L'immeuble sélectionné n'appartient pas à votre agence."
        ) {

            return res.status(403).json({

                message:
                    err.message

            });

        }


        res.status(500).json({

            message:
                "Erreur lors de la création."

        });

    }

}


// =========================================================
// MODIFICATION
// =========================================================

async function update(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const apartment =
            await Apartment.update(

                req.params.id,

                req.body,

                agencyId

            );


        if (!apartment) {

            return res.status(404).json({

                message:
                    "Appartement introuvable."

            });

        }


        await AuditService.log(req, {

            action: "UPDATE",

            module: "apartments",

            entity_id:
                apartment.id,

            details: {

                agency_id:
                    agencyId

            }

        });


        res.json(apartment);

    }

    catch (err) {

        console.error(
            "APARTMENT UPDATE ERROR:",
            err
        );


        if (
            err.message ===
            "L'immeuble sélectionné n'appartient pas à votre agence."
        ) {

            return res.status(403).json({

                message:
                    err.message

            });

        }


        res.status(500).json({

            message:
                "Erreur lors de la modification."

        });

    }

}


// =========================================================
// SUPPRESSION
// =========================================================

async function remove(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const apartment =
            await Apartment.getById(

                req.params.id,

                agencyId

            );


        if (!apartment) {

            return res.status(404).json({

                message:
                    "Appartement introuvable."

            });

        }


        const deleted =
            await Apartment.remove(

                req.params.id,

                agencyId

            );


        if (!deleted) {

            return res.status(404).json({

                message:
                    "Appartement introuvable."

            });

        }


        await AuditService.log(req, {

            action: "DELETE",

            module: "apartments",

            entity_id:
                apartment.id,

            details: {

                agency_id:
                    agencyId

            }

        });


        res.json({

            message:
                "Appartement supprimé."

        });

    }

    catch (err) {

        console.error(
            "APARTMENT DELETE ERROR:",
            err
        );

        res.status(500).json({

            message:
                "Erreur lors de la suppression."

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