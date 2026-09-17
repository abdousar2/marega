require("dotenv").config();

const AuditLog = require("./src/models/audit.model");
const db = require("./src/config/database");

(async () => {

    try {

        const agency1 =
            await AuditLog.getAll({
                agencyId: 1,
                limit: 100,
                offset: 0
            });

        console.log("=== AUDIT AGENCE 1 ===");

        console.table(
            agency1.filter(
                log => log.action === "TEST_ISOLATION"
            )
        );


        const agency5 =
            await AuditLog.getAll({
                agencyId: 5,
                limit: 100,
                offset: 0
            });

        console.log("=== AUDIT AGENCE 5 ===");

        console.table(
            agency5.filter(
                log => log.action === "TEST_ISOLATION"
            )
        );


    }

    catch (error) {

        console.error(
            "? ERREUR :",
            error
        );

    }

    finally {

        await db.end();

    }

})();
