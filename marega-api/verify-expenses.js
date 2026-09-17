require("dotenv").config();
const db = require("./src/config/database");

async function verify() {
    try {
        const result = await db.query(`
            SELECT
                column_name,
                data_type,
                is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'marega'
              AND table_name = 'expenses'
              AND column_name = 'agency_id'
        `);

        console.table(result.rows);

        const migration = await db.query(`
            SELECT filename, executed_at
            FROM marega.migrations
            WHERE filename = '016_add_expense_agency_isolation.sql'
        `);

        console.table(migration.rows);

    } finally {
        await db.end();
    }
}

verify();
