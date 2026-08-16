require("dotenv").config();

const db = require("./src/config/database");

async function check() {

    try {

        const result = await db.query(`
            SELECT
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                rc.delete_rule,
                rc.update_rule,
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc

            LEFT JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema

            LEFT JOIN information_schema.referential_constraints rc
                ON tc.constraint_name = rc.constraint_name
                AND tc.table_schema = rc.constraint_schema

            LEFT JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
                AND tc.table_schema = ccu.table_schema

            WHERE tc.table_schema = 'marega'
              AND tc.table_name = 'expenses'

            ORDER BY tc.constraint_type, tc.constraint_name;
        `);

        console.table(result.rows);

    }

    catch (error) {

        console.error(error);

    }

    finally {

        process.exit();

    }

}

check();
