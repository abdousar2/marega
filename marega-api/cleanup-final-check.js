require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {

    const client = await pool.connect();

    try {

        console.log("\n========================================");
        console.log(" AUDIT TEST AGENCE 6");
        console.log(" VERIFICATION AVANT SUPPRESSION");
        console.log("========================================\n");

        const audit = await client.query(`
            SELECT
                id,
                agency_id,
                user_id,
                module,
                action,
                entity_id,
                created_at,
                details
            FROM marega.audit_logs
            WHERE agency_id = 6
              AND (
                    details::text ~* '(TEST|simulation|transaction|contrat-loyers)'
                    OR entity_id IN (17,27,78,114,115,116)
              )
            ORDER BY id;
        `);

        for (const row of audit.rows) {

            console.log("\n----------------------------------------");

            console.log(
                `ID=${row.id} | module=${row.module} | action=${row.action} | entity=${row.entity_id}`
            );

            console.log(
                `user_id=${row.user_id} | created_at=${row.created_at}`
            );

            console.dir(
                row.details,
                { depth: null }
            );
        }


        console.log("\n========================================");
        console.log(" CONTACT REQUEST TEST");
        console.log("========================================\n");

        const contacts = await client.query(`
            SELECT *
            FROM marega.contact_requests
            WHERE id = 1;
        `);

        console.table(contacts.rows);


        console.log("\n========================================");
        console.log(" VERIFICATION TERMINEE");
        console.log(" AUCUNE DONNEE MODIFIEE");
        console.log("========================================\n");

    } finally {

        client.release();
        await pool.end();

    }
}

main().catch(err => {

    console.error("\n❌ ERREUR :", err);

    process.exit(1);

});
