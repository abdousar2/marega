const Tenant =
    require("../models/tenants.model");

const AuditService =
    require("../services/audit.service");


// =========================================================
// TOUS LES LOCATAIRES
// =========================================================

async function getAll(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const tenants =
            await Tenant.getAll(
                agencyId
            );


        res.json(tenants);

    }

    catch (err) {

        console.error(
            "TENANTS GET ALL ERROR:",
            err
        );

        res.status(500).json({

            message:
                "Erreur serveur."

        });

    }

}


// =========================================================
// LOCATAIRE PAR ID
// =========================================================

async function getById(req, res) {

    try {

        const agencyId =
            req.user.agency_id;


        const tenant =
            await Tenant.getById(

                req.params.id,

                agencyId

            );


        if (!tenant) {

            return res.status(404).json({

                message:
                    "Locataire introuvable."

            });

        }


        res.json(tenant);

    }

    catch (err) {

        console.error(
            "TENANT GET BY ID ERROR:",
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


        const tenant =
            await Tenant.create(

                req.body,

                agencyId

            );


        await AuditService.log(req, {

            action: "CREATE",

            module: "tenants",

            entity_id:
                tenant.id,

            details: {

                agency_id:
                    agencyId,

                apartment_id:
                    tenant.apartment_id

            }

        });


        res.status(201).json(
            tenant
        );

    }

    catch (err) {

        console.error(
            "TENANT CREATE ERROR:",
            err
        );


        if (
            err.message ===
            "L'appartement sélectionné n'appartient pas à votre agence."
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


        const tenant =
            await Tenant.update(

                req.params.id,

                req.body,

                agencyId

            );


        if (!tenant) {

            return res.status(404).json({

                message:
                    "Locataire introuvable."

            });

        }


        await AuditService.log(req, {

            action: "UPDATE",

            module: "tenants",

            entity_id:
                tenant.id,

            details: {

                agency_id:
                    agencyId

            }

        });


        res.json(tenant);

    }

    catch (err) {

        console.error(
            "TENANT UPDATE ERROR:",
            err
        );


        if (
            err.message ===
            "L'appartement sélectionné n'appartient pas à votre agence."
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


        const tenant =
            await Tenant.getById(

                req.params.id,

                agencyId

            );


        if (!tenant) {

            return res.status(404).json({

                message:
                    "Locataire introuvable."

            });

        }


        const deleted =
            await Tenant.remove(

                req.params.id,

                agencyId

            );


        if (!deleted) {

            return res.status(404).json({

                message:
                    "Locataire introuvable."

            });

        }


        await AuditService.log(req, {

            action: "DELETE",

            module: "tenants",

            entity_id:
                tenant.id,

            details: {

                agency_id:
                    agencyId

            }

        });


        res.json({

            message:
                "Locataire supprimé."

        });

    }

    catch (err) {

        console.error(
            "TENANT DELETE ERROR:",
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
    create,
    update,
    remove

};