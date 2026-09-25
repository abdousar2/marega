const AuditLog =
    require("../models/audit.model");


const AuditService = {

    // =========================================================
    // ENREGISTRER UNE ACTION
    // =========================================================

    async log(
        req,
        {
            user_id = null,
            agency_id = null,
            action,
            module,
            entity_id = null,
            details = null,
            client = null,
            throwOnError = false
        }
    ) {

        try {

            return await AuditLog.create(

                {

                    user_id:
                        user_id ||
                        req?.user?.id ||
                        null,

                    agency_id:
                        agency_id ??
                        req?.user?.agency_id ??
                        null,

                    action,

                    module,

                    entity_id,

                    details,

                    ip_address:
                        req?.ip || null,

                    user_agent:
                        req?.get("user-agent") || null

                },

                client || undefined

            );

        }

        catch (err) {

            console.error(
                "Erreur journalisation audit :",
                err
            );

            if (throwOnError) {
                throw err;
            }

            return null;

        }

    }

};


module.exports = AuditService;