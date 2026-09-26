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
        console.log(" CONTRAINTES FK — AVANT NETTOYAGE");
        console.log(" LECTURE SEULE");
        console.log("====================================================\n");

        const result = await client.query(`
            SELECT
                tc.table_name AS child_table,
                kcu.column_name AS child_column,
                ccu.table_name AS parent_table,
                ccu.column_name AS parent_column,
                rc.delete_rule,
                rc.update_rule
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
               AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
               AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints rc
                ON rc.constraint_name = tc.constraint_name
               AND rc.constraint_schema = tc.table_schema
            WHERE tc.table_schema = 'marega'
              AND tc.constraint_type = 'FOREIGN KEY'
            ORDER BY
                ccu.table_name,
                tc.table_name,
                kcu.column_name;
        `);

        console.table(result.rows);


        console.log("\n====================================================");
        console.log(" DOCUMENT TEMPLATES PAR AGENCE");
        console.log("====================================================\n");

        const templates = await client.query(`
            SELECT
                agency_id,
                document_type,
                COUNT(*)::int AS total
            FROM marega.document_templates
            GROUP BY agency_id, document_type
            ORDER BY agency_id, document_type;
        `);

        console.table(templates.rows);


        console.log("\n====================================================");
        console.log(" AGENCY TERMS PAR AGENCE");
        console.log("====================================================\n");

        const terms = await client.query(`
            SELECT
                agency_id,
                COUNT(*)::int AS total
            FROM marega.agency_terms
            GROUP BY agency_id
            ORDER BY agency_id;
        `);

        console.table(terms.rows);


        console.log("\n====================================================");
        console.log(" LANDLORDS");
        console.log("====================================================\n");

        const landlords = await client.query(`
            SELECT *
            FROM marega.landlords
            ORDER BY id;
        `);

        console.table(landlords.rows);


        console.log("\n====================================================");
        console.log(" FIN");
        console.log(" AUCUNE DONNEE N'A ETE MODIFIEE");
        console.log("====================================================\n");

    } finally {

        client.release();
        await pool.end();

    }
}

main().catch(err => {

    console.error("\n❌ ERREUR :", err);

    process.exit(1);

});
