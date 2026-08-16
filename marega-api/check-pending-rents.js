require("dotenv").config();

const db = require("./src/config/database");

async function check() {

    try {

        const result = await db.query(`

            SELECT
                id,
                lease_id,
                tenant_id,
                due_month,
                due_date,
                amount,
                status,
                payment_id

            FROM marega.rents

            WHERE payment_id IS NULL

            ORDER BY due_date ASC

            LIMIT 10

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
