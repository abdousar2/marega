const Building =
    require("../models/buildings.model");

const AuditService =
    require("../services/audit.service");


async function getAll(req, res) {

    try {

        const buildings =
            await Building.getAll();

        res.json(buildings);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Erreur serveur"

        });

    }

}


async function getById(req, res) {

    try {

        const building =
            await Building.getById(
                req.params.id
            );


        if (!building) {

            return res.status(404).json({

                message:
                    "Immeuble introuvable"

            });

        }


        res.json(building);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Erreur serveur"

        });

    }

}


async function create(req, res) {

    try {

        if (!req.body.code) {

            req.body.code =
                "BLD-" + Date.now();

        }


        const building =
            await Building.create(
                req.body
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

        console.error(error);

        res.status(500).json({

            message:
                "Erreur lors de la création"

        });

    }

}


async function update(req, res) {

    try {

        const building =
            await Building.update(

                req.params.id,

                req.body

            );


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

        console.error(error);

        res.status(500).json({

            message:
                "Erreur lors de la modification"

        });

    }

}


async function remove(req, res) {

    try {

        const building =
            await Building.getById(
                req.params.id
            );


        if (!building) {

            return res.status(404).json({

                message:
                    "Immeuble introuvable"

            });

        }


        await Building.remove(
            req.params.id
        );


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

        console.error(error);

        res.status(500).json({

            message:
                "Erreur lors de la suppression"

        });

    }

}


module.exports = {

    getAll,

    getById,

    create,

    update,

    remove

};