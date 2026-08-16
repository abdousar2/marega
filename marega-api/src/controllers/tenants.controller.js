const Tenant =
    require("../models/tenants.model");

const AuditService =
    require("../services/audit.service");

async function getAll(req, res) {

    try {

        const tenants = await Tenant.getAll();

        res.json(tenants);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function getById(req, res) {

    try {

        const tenant = await Tenant.getById(req.params.id);

        if (!tenant) {

            return res.status(404).json({
                message: "Locataire introuvable."
            });

        }

        res.json(tenant);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

async function create(req, res) {

    try {

        const tenant =
            await Tenant.create(req.body);


        await AuditService.log(req, {

            action: "CREATE",

            module: "tenants",

            entity_id:
                tenant.id

        });


        res.status(201).json(tenant);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur lors de la création."
        });

    }

}

async function update(req, res) {

    try {

        const tenant = await Tenant.update(
            req.params.id,
            req.body
        );

        if (!tenant) {

            return res.status(404).json({
                message: "Locataire introuvable."
            });

        }

        await AuditService.log(req, {

            action: "UPDATE",

            module: "tenants",

            entity_id:
                tenant.id

        });

        res.json(tenant);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur lors de la modification."
        });

    }

}

async function remove(req, res) {

    try {

        const tenant =
            await Tenant.getById(
                req.params.id
            );


        if (!tenant) {

            return res.status(404).json({

                message:
                    "Locataire introuvable."

            });

        }


        await Tenant.remove(
            req.params.id
        );


        await AuditService.log(req, {

            action: "DELETE",

            module: "tenants",

            entity_id:
                tenant.id

        });


        res.json({

            message:
                "Locataire supprimé."

        });

    }

    catch (err) {

        console.error(err);

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