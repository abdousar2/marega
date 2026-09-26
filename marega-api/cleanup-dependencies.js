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

        console.log("\n====================================================");
        console.log(" DEPENDANCES AVANT NETTOYAGE");
        console.log(" LECTURE SEULE — AUCUNE MODIFICATION");
        console.log("====================================================\n");


        // ====================================================
        // 1. AGENCES TEST 2-5
        // ====================================================

        console.log("=== DEPENDANCES AGENCES 2 / 3 / 4 / 5 ===\n");

        for (const agencyId of [2, 3, 4, 5]) {

            console.log(`\n--------------- AGENCE ${agencyId} ---------------`);

            const agency = await client.query(`
                SELECT *
                FROM marega.agencies
                WHERE id = $1;
            `, [agencyId]);

            console.table(agency.rows);

            const relatedTables = [
                "agency_users",
                "buildings",
                "apartments",
                "tenants",
                "leases",
                "rents",
                "payments",
                "expenses"
            ];

            for (const table of relatedTables) {

                const result = await client.query(`
                    SELECT COUNT(*)::int AS total
                    FROM marega."${table}"
                    WHERE agency_id = $1;
                `, [agencyId]);

                console.log(
                    `${table.padEnd(20)} ${result.rows[0].total}`
                );
            }
        }


        // ====================================================
        // 2. UTILISATEURS SANS AGENCE
        // ====================================================

        console.log("\n====================================================");
        console.log(" UTILISATEURS SANS AGENCE");
        console.log("====================================================\n");

        const orphanUsers = await client.query(`
            SELECT
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.active
            FROM marega.users u
            LEFT JOIN marega.agency_users au
                ON au.user_id = u.id
            WHERE au.user_id IS NULL
            ORDER BY u.id;
        `);

        console.table(orphanUsers.rows);


        // ====================================================
        // 3. USERS TEST + AUDIT
        // ====================================================

        console.log("\n====================================================");
        console.log(" UTILISATEURS TEST ET LEURS AUDITS");
        console.log("====================================================\n");

        const testUsers = await client.query(`
            SELECT
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.active,
                au.agency_id,
                au.role,
                au.active AS membership_active
            FROM marega.users u
            LEFT JOIN marega.agency_users au
                ON au.user_id = u.id
            WHERE u.id IN (7,8,9,10,12,15)
            ORDER BY u.id;
        `);

        console.table(testUsers.rows);

        for (const row of testUsers.rows) {

            const audits = await client.query(`
                SELECT
                    id,
                    agency_id,
                    module,
                    action,
                    entity_id,
                    created_at
                FROM marega.audit_logs
                WHERE user_id = $1
                ORDER BY id;
            `, [row.id]);

            console.log(
                `\nAUDIT user ${row.id} — ${row.email}`
            );

            console.table(audits.rows);
        }


        // ====================================================
        // 4. CONTRAT TEST 27 + LOYERS
        // ====================================================

        console.log("\n====================================================");
        console.log(" CONTRAT TEST 27 ET LOYERS");
        console.log("====================================================\n");

        const lease = await client.query(`
            SELECT
                *
            FROM marega.leases
            WHERE id = 27;
        `);

        console.table(lease.rows);

        const rents = await client.query(`
            SELECT
                id,
                lease_id,
                due_month,
                due_date,
                amount,
                status,
                payment_id,
                agency_id
            FROM marega.rents
            WHERE lease_id = 27
            ORDER BY id;
        `);

        console.table(rents.rows);


        // ====================================================
        // 5. PAIEMENT TEST 17
        // ====================================================

        console.log("\n====================================================");
        console.log(" PAIEMENT TEST 17 ET LOYER ASSOCIE");
        console.log("====================================================\n");

        const payment = await client.query(`
            SELECT *
            FROM marega.payments
            WHERE id = 17;
        `);

        console.table(payment.rows);

        const paymentRent = await client.query(`
            SELECT
                id,
                lease_id,
                due_month,
                due_date,
                amount,
                status,
                payment_id,
                agency_id
            FROM marega.rents
            WHERE payment_id = 17;
        `);

        console.table(paymentRent.rows);


        // ====================================================
        // 6. PDF DES CONTRATS
        // ====================================================

        console.log("\n====================================================");
        console.log(" FICHIERS REFERENCES PAR LES CONTRATS");
        console.log("====================================================\n");

        const contractFiles = await client.query(`
            SELECT
                id,
                agency_id,
                contract_number,
                pdf_path
            FROM marega.leases
            WHERE pdf_path IS NOT NULL
            ORDER BY id;
        `);

        console.table(contractFiles.rows);


        // ====================================================
        // 7. DOCUMENTS DES AGENCES
        // ====================================================

        console.log("\n====================================================");
        console.log(" FICHIERS REFERENCES PAR LES AGENCES");
        console.log("====================================================\n");

        const agencyFiles = await client.query(`
            SELECT
                id,
                name,
                logo_path,
                contract_template_path,
                receipt_template_path
            FROM marega.agencies
            WHERE
                logo_path IS NOT NULL
                OR contract_template_path IS NOT NULL
                OR receipt_template_path IS NOT NULL
            ORDER BY id;
        `);

        console.table(agencyFiles.rows);


        // ====================================================
        // 8. TEMPLATES — STRUCTURE ET AGENCE
        // ====================================================

        console.log("\n====================================================");
        console.log(" DOCUMENT TEMPLATES — STRUCTURE");
        console.log("====================================================\n");

        const templateColumns = await client.query(`
            SELECT
                column_name,
                data_type
            FROM information_schema.columns
            WHERE table_schema = 'marega'
              AND table_name = 'document_templates'
            ORDER BY ordinal_position;
        `);

        console.table(templateColumns.rows);


        // ====================================================
        // 9. FIN
        // ====================================================

        console.log("\n====================================================");
        console.log(" DEPENDANCES TERMINEES");
        console.log(" AUCUNE DONNEE N'A ETE MODIFIEE");
        console.log("====================================================\n");

    } finally {

        client.release();
        await pool.end();

    }
}

main().catch(err => {

    console.error(
        "\n❌ ERREUR DEPENDANCES :",
        err
    );

    process.exit(1);

});
