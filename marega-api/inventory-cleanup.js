require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const SCHEMA = "marega";

async function main() {

    const client = await pool.connect();

    try {

        console.log("\n========================================");
        console.log(" INVENTAIRE BASE MAREGA");
        console.log(" SCHEMA :", SCHEMA);
        console.log("========================================\n");


        // -----------------------------------------------------
        // 0. VERIFICATION DU SCHEMA
        // -----------------------------------------------------

        const schemaCheck = await client.query(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.schemata
                WHERE schema_name = $1
            ) AS exists;
        `, [SCHEMA]);

        if (!schemaCheck.rows[0].exists) {

            throw new Error(
                `Le schéma "${SCHEMA}" n'existe pas dans cette base.`
            );
        }


        // -----------------------------------------------------
        // 1. TABLES
        // -----------------------------------------------------

        const tables = await client.query(`
            SELECT
                table_name
            FROM information_schema.tables
            WHERE table_schema = $1
              AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `, [SCHEMA]);


        console.log("TABLES :");

        for (const row of tables.rows) {

            const table =
                row.table_name;

            const count =
                await client.query(`
                    SELECT COUNT(*)::int AS count
                    FROM "${SCHEMA}"."${table}";
                `);

            console.log(
                `  ${table.padEnd(30)} ${count.rows[0].count}`
            );
        }


        // -----------------------------------------------------
        // 2. AGENCES
        // -----------------------------------------------------

        console.log("\n========================================");
        console.log(" AGENCES");
        console.log("========================================\n");


        const hasAgencies =
            tables.rows.some(
                row => row.table_name === "agencies"
            );


        if (hasAgencies) {

            const agencies =
                await client.query(`
                    SELECT *
                    FROM "${SCHEMA}".agencies
                    ORDER BY id;
                `);

            console.table(
                agencies.rows
            );

        } else {

            console.log(
                "⚠️ Table agencies absente."
            );

        }


        // -----------------------------------------------------
        // 3. UTILISATEURS
        // -----------------------------------------------------

        console.log("\n========================================");
        console.log(" UTILISATEURS");
        console.log("========================================\n");


        const hasUsers =
            tables.rows.some(
                row => row.table_name === "users"
            );

        const hasAgencyUsers =
            tables.rows.some(
                row => row.table_name === "agency_users"
            );


        if (
            hasUsers &&
            hasAgencyUsers
        ) {

            const users =
                await client.query(`
                    SELECT
                        u.id,
                        u.email,
                        u.first_name,
                        u.last_name,
                        u.active,
                        au.agency_id,
                        au.role,
                        au.active AS agency_membership_active
                    FROM "${SCHEMA}".users u
                    LEFT JOIN "${SCHEMA}".agency_users au
                        ON au.user_id = u.id
                    ORDER BY
                        u.id,
                        au.agency_id;
                `);

            console.table(
                users.rows
            );

        } else {

            console.log(
                "⚠️ Tables users / agency_users absentes."
            );

        }


        // -----------------------------------------------------
        // 4. DONNEES METIER PAR AGENCE
        // -----------------------------------------------------

        const businessTables = [
            "buildings",
            "apartments",
            "tenants",
            "leases",
            "rents",
            "payments",
            "expenses"
        ];


        console.log("\n========================================");
        console.log(" DONNEES METIER PAR AGENCE");
        console.log("========================================\n");


        for (const table of businessTables) {

            const exists =
                tables.rows.some(
                    row =>
                        row.table_name === table
                );


            if (!exists) {

                console.log(
                    `⚠️ ${table} : table absente`
                );

                continue;
            }


            const result =
                await client.query(`
                    SELECT
                        agency_id,
                        COUNT(*)::int AS total
                    FROM "${SCHEMA}"."${table}"
                    GROUP BY agency_id
                    ORDER BY agency_id;
                `);


            console.log(`\n${table}`);

            console.table(
                result.rows
            );
        }


        // -----------------------------------------------------
        // 5. MARQUEURS DE TEST
        // -----------------------------------------------------

        console.log("\n========================================");
        console.log(" RECHERCHE DE MARQUEURS DE TEST");
        console.log("========================================\n");


        const columns =
            await client.query(`
                SELECT
                    table_name,
                    column_name,
                    data_type
                FROM information_schema.columns
                WHERE table_schema = $1
                  AND data_type IN (
                      'character varying',
                      'text',
                      'character',
                      'json',
                      'jsonb'
                  )
                ORDER BY
                    table_name,
                    ordinal_position;
            `, [SCHEMA]);


        let foundTestData =
            false;


        for (const col of columns.rows) {

            const table =
                col.table_name;

            const column =
                col.column_name;


            try {

                const result =
                    await client.query(`
                        SELECT
                            COUNT(*)::int AS matches
                        FROM "${SCHEMA}"."${table}"
                        WHERE CAST("${column}" AS text)
                        ~* '(test|simulation|demo|transaction|contrat-loyers)';
                    `);


                const matches =
                    result.rows[0].matches;


                if (matches > 0) {

                    foundTestData =
                        true;


                    console.log(
                        `⚠️ ${table}.${column} -> ${matches} correspondance(s)`
                    );
                }

            } catch (err) {

                // Ignore les colonnes problématiques.

            }
        }


        if (!foundTestData) {

            console.log(
                "Aucun marqueur évident de test trouvé."
            );

        }


        // -----------------------------------------------------
        // 6. AUDIT
        // -----------------------------------------------------

        const hasAudit =
            tables.rows.some(
                row =>
                    row.table_name === "audit_logs"
            );


        if (hasAudit) {

            console.log("\n========================================");
            console.log(" AUDIT");
            console.log("========================================\n");


            const audit =
                await client.query(`
                    SELECT
                        COUNT(*)::int AS total
                    FROM "${SCHEMA}".audit_logs;
                `);


            console.log(
                `Total logs audit : ${audit.rows[0].total}`
            );

        } else {

            console.log(
                "\n⚠️ Table audit_logs absente."
            );

        }


        // -----------------------------------------------------
        // 7. FIN
        // -----------------------------------------------------

        console.log("\n========================================");
        console.log(" INVENTAIRE TERMINE");
        console.log(" AUCUNE DONNEE N'A ETE MODIFIEE");
        console.log("========================================\n");

    } finally {

        client.release();

    }


    await pool.end();
}


main().catch(err => {

    console.error(
        "\n❌ ERREUR INVENTAIRE :",
        err
    );

    process.exit(1);

});
