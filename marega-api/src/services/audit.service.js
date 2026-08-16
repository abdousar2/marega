const AuditLog = require("../models/audit.model");


const AuditService = {

    // =========================================================
    // ENREGISTRER UNE ACTION
    // =========================================================

    async log(
        req,
        {
            user_id = null,
            action,
            module,
            entity_id = null,
            details = null
        }
    ) {

        try {

            await AuditLog.create({

                user_id:
                    user_id ||
                    req?.user?.id ||
                    null,

                action,

                module,

                entity_id,

                details,

                ip_address:
                    req?.ip || null,

                user_agent:
                    req?.get("user-agent") || null

            });

        }

        catch (err) {

            console.error(
                "Erreur journalisation audit :",
                err
            );

        }

    }

};


module.exports = AuditService;