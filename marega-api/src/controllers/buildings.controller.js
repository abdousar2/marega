const Building =
    require("../models/buildings.model");

const AuditService =
    require("../services/audit.service");


// =========================================================
// VÉRIFICATION AGENCE
// =========================================================

function getAgencyId(req) {

    const agencyId =
        Number(req.user?.agency_id);


    if (!Number.isInteger(agencyId)) {

        const error =
            new Error(
                "Agence utilisateur introuvable."
            );

        error.status = 403;

        throw error;

    }


    return agencyId;

}


// =========================================================
// CONSULTATION
// =========================================================

async function getAll(req, res) {

    try {

        const agencyId =
            getAgencyId(req);


        const buildings =
            await Building.getAll(
                agencyId
            );


        res.json(buildings);

    }

    catch (error) {

        console.error(
            "BUILDINGS GET ALL ERROR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Erreur serveur"

        });

    }

}


// =========================================================
// CONSULTATION D'UN BÂTIMENT
// =========================================================

async function getById(req, res) {

    try {

        const agencyId =
            getAgencyId(req);


        const building =
            await Building.getById(
                req.params.id,
                agencyId
            );


        if (!building) {

            return res.status(404).json({

                message:
                    "Immeuble introuvable."

            });

        }


        res.json(building);

    }

    catch (error) {

        console.error(
            "BUILDING GET BY ID ERROR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Erreur serveur"

        });

    }

}


// =========================================================
// CRÉATION
// =========================================================

async function create(req, res) {

    try {

        const agencyId =
            getAgencyId(req);


        // Génération automatique du code
        if (!req.body.code) {

            req.body.code =
                "BLD-" + Date.now();

        }


        const building =
            await Building.create(
                req.body,
                agencyId
            );


        await AuditService.log(req, {

            action: "CREATE",

            module: "buildings",

            entity_id:
                building.id,

            details: {

                code:
                    building.code

            }

        });


        res.status(201).json(
            building
        );

    }

    catch (error) {

        console.error(
            "BUILDING CREATE ERROR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Erreur lors de la création"

        });

    }

}


// =========================================================
// MODIFICATION
// =========================================================

async function update(req, res) {

    try {

        const agencyId =
            getAgencyId(req);


        const building =
            await Building.update(

                req.params.id,

                req.body,

                agencyId

            );


        // Le bâtiment n'existe pas
        // OU appartient à une autre agence

        if (!building) {

            return res.status(404).json({

                message:
                    "Immeuble introuvable."

            });

        }


        await AuditService.log(req, {

            action: "UPDATE",

            module: "buildings",

            entity_id:
                building.id,

            details: {

                code:
                    building.code

            }

        });


        res.json(building);

    }

    catch (error) {

        console.error(
            "BUILDING UPDATE ERROR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Erreur lors de la modification"

        });

    }

}


// =========================================================
// SUPPRESSION
// =========================================================

async function remove(req, res) {

    try {

        const agencyId =
            getAgencyId(req);


        const building =
            await Building.remove(

                req.params.id,

                agencyId

            );


        // Cela signifie également :
        // le bâtiment appartient peut-être
        // à une autre agence.

        if (!building) {

            return res.status(404).json({

                message:
                    "Immeuble introuvable."

            });

        }


        await AuditService.log(req, {

            action: "DELETE",

            module: "buildings",

            entity_id:
                building.id,

            details: {

                code:
                    building.code

            }

        });


        res.json({

            message:
                "Immeuble supprimé"

        });

    }

    catch (error) {

        console.error(
            "BUILDING DELETE ERROR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            message:
                error.message ||
                "Erreur lors de la suppression"

        });

    }

}


// =========================================================

module.exports = {

    getAll,
    getById,
    create,
    update,
    remove

};