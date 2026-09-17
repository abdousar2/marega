require("dotenv").config();

const AuditLog = require("./src/models/audit.model");
const db = require("./src/config/database");

(async () => {

    try {

        console.log("=== AUDIT AGENCE 1 ===");

        const audit1 =
            await AuditLog.create({
                user_id: 1,
                agency_id: 1,
                action: "TEST_ISOLATION",
                module: "test",
                entity_id: null,
                details: {
                    test: true,
                    agency: 1
                }
            });

        console.log(audit1);


        console.log("\n=== AUDIT AGENCE 5 ===");

        const audit5 =
            await AuditLog.create({
                user_id: 12,
                agency_id: 5,
                action: "TEST_ISOLATION",
                module: "test",
                entity_id: null,
                details: {
                    test: true,
                    agency: 5
                }
            });

        console.log(audit5);


        console.log("\n=== VÉRIFICATION ===");

        const result =
            await db.query(
                `
                SELECT
                    id,
                    user_id,
                    agency_id,
                    action,
                    module
                FROM marega.audit_logs
                WHERE id IN ($1, $2)
                ORDER BY id
                `,
                [
                    audit1.id,
                    audit5.id
                ]
            );

        console.table(result.rows);

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
