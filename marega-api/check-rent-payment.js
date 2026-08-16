require("dotenv").config();

const db = require("./src/config/database");

async function check() {

    try {

        const result = await db.query(`
            SELECT
                r.id AS rent_id,
                r.lease_id,
                r.tenant_id,
                r.due_month,
                r.amount AS rent_amount,
                r.status AS rent_status,
                r.payment_id,

                p.id AS payment_id_check,
                p.amount AS payment_amount,
                p.payment_date,
                p.payment_method,
                p.status AS payment_status,
                p.receipt_path

            FROM marega.rents r

            LEFT JOIN marega.payments p
                ON p.id = r.payment_id

            WHERE r.id = 18
        `);

        console.dir(result.rows, {
            depth: null
        });

    }

    catch (error) {

        console.error(error);

    }

    finally {

        process.exit();

    }

}

check();
