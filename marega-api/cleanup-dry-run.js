require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function preview(client, label, sql, params = []) {

    const result = await client.query(sql, params);

    console.log(
        `${label.padEnd(45)} ${result.rowCount}`
    );

    return result;
}

async function main() {

    const client = await pool.connect();

    try {

        console.log("\n====================================================");
        console.log(" DRY-RUN NETTOYAGE");
        console.log(" DELETE EXECUTES PUIS ROLLBACK");
        console.log(" AUCUNE MODIFICATION CONSERVEE");
        console.log("====================================================\n");

        await client.query("BEGIN");

        console.log("=== AGENCES 2 / 3 / 4 / 5 ===\n");

        await preview(
            client,
            "agency_terms agence 5",
            `DELETE FROM marega.agency_terms
             WHERE agency_id = 5
             RETURNING id`
        );

        await preview(
            client,
            "document_templates agence 5",
            `DELETE FROM marega.document_templates
             WHERE agency_id = 5
             RETURNING id`
        );

        await preview(
            client,
            "tenants agence 5",
            `DELETE FROM marega.tenants
             WHERE agency_id = 5
             RETURNING id`
        );

        await preview(
            client,
            "apartments agence 5",
            `DELETE FROM marega.apartments
             WHERE agency_id = 5
             RETURNING id`
        );

        await preview(
            client,
            "buildings agence 5",
            `DELETE FROM marega.buildings
             WHERE agency_id = 5
             RETURNING id`
        );

        await preview(
            client,
            "landlords agence 5",
            `DELETE FROM marega.landlords
             WHERE agency_id = 5
             RETURNING id`
        );

        await preview(
            client,
            "agency_users agences 2-5",
            `DELETE FROM marega.agency_users
             WHERE agency_id IN (2,3,4,5)
             RETURNING user_id, agency_id`
        );


        console.log("\n=== CONTRAT / PAIEMENT TEST AGENCE 6 ===\n");

        await preview(
            client,
            "rents contrat 27",
            `DELETE FROM marega.rents
             WHERE lease_id = 27
             RETURNING id`
        );

        await preview(
            client,
            "lease 27",
            `DELETE FROM marega.leases
             WHERE id = 27
             RETURNING id`
        );


        await client.query(`
            UPDATE marega.rents
            SET
                payment_id = NULL,
                status = 'Impayé'
            WHERE id = 78
              AND payment_id = 17;
        `);

        console.log(
            "rent 78 restauration".padEnd(45),
            "1"
        );


        await preview(
            client,
            "payment 17",
            `DELETE FROM marega.payments
             WHERE id = 17
             RETURNING id`
        );


        console.log("\n=== UTILISATEURS DE TEST ===\n");

        await preview(
            client,
            "users 7,8,9,10,12,15",
            `DELETE FROM marega.users
             WHERE id IN (7,8,9,10,12,15)
             RETURNING id, email`
        );


        console.log("\n=== AUDIT DES AGENCES TEST ===\n");

        await preview(
            client,
            "audit agences 2-5",
            `DELETE FROM marega.audit_logs
             WHERE agency_id IN (2,3,4,5)
             RETURNING id`
        );


        console.log("\n=== AUDIT UTILISATEURS TEST ===\n");

        await preview(
            client,
            "audit users test",
            `DELETE FROM marega.audit_logs
             WHERE user_id IN (7,8,9,10,12,15)
             RETURNING id`
        );


        console.log("\n=== AUDIT OPERATIONS TEST AGENCE 6 ===\n");

        await preview(
            client,
            "audit test agency 6",
            `DELETE FROM marega.audit_logs
             WHERE agency_id = 6
               AND (
                    details::text ~* '(TEST|simulation|transaction|contrat-loyers)'
                    OR entity_id IN (17,27,78,114,115,116)
               )
             RETURNING id`
        );


        console.log("\n=== AGENCES ===\n");

        await preview(
            client,
            "agences 2,3,4,5",
            `DELETE FROM marega.agencies
             WHERE id IN (2,3,4,5)
             RETURNING id, name`
        );


        console.log("\n====================================================");
        console.log(" ROLLBACK");
        console.log(" AUCUNE DONNEE N'A ETE MODIFIEE");
        console.log("====================================================\n");

        await client.query("ROLLBACK");

    } catch (err) {

        try {
            await client.query("ROLLBACK");
        } catch {}

        throw err;

    } finally {

        client.release();
        await pool.end();

    }
}

main().catch(err => {

    console.error("\n❌ DRY-RUN ERREUR :", err);

    process.exit(1);
});
