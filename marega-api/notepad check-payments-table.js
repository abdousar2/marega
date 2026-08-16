require("dotenv").config();

const db = require("./src/config/database");

async function check() {

    try {

        const result = await db.query(`
            SELECT
                column_name,
                data_type,
                column_default,
                is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'marega'
              AND table_name = 'payments'
            ORDER BY ordinal_position
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