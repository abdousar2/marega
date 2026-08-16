require("dotenv").config();

const db = require("./src/config/database");

async function check() {

    try {

        const result = await db.query(`
            SELECT
                id,
                user_id,
                action,
                module,
                entity_id,
                details,
                created_at
            FROM marega.audit_logs
            WHERE module = 'payments'
            ORDER BY id DESC
            LIMIT 10
        `);

        console.dir(
            result.rows,
            {
                depth: null
            }
        );

    }

    catch (error) {

        console.error(error);

    }

    finally {

        process.exit();

    }

}

check();
