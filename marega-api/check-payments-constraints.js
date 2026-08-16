require("dotenv").config();

const db = require("./src/config/database");

async function check() {

    try {

        const result = await db.query(`

            SELECT
                tc.constraint_name,
                kcu.column_name,
                rc.delete_rule,
                rc.update_rule

            FROM information_schema.table_constraints tc

            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema

            JOIN information_schema.referential_constraints rc
                ON tc.constraint_name = rc.constraint_name
                AND tc.table_schema = rc.constraint_schema

            WHERE tc.table_schema = 'marega'
              AND tc.table_name = 'payments'
              AND tc.constraint_type = 'FOREIGN KEY'

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
