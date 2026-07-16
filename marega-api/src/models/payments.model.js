const db = require("../config/database");

class Payment {

    static async getAll() {

        const result = await db.query(`

            SELECT

                p.*,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                l.contract_number

            FROM marega.payments p

            JOIN marega.tenants t
                ON t.id = p.tenant_id

            LEFT JOIN marega.leases l
                ON l.id = p.lease_id

            ORDER BY payment_month DESC,
                     id DESC

        `);

        return result.rows;

    }

    static async getById(id) {

        const result = await db.query(

            `
            SELECT *

            FROM marega.payments

            WHERE id=$1
            `,

            [id]

        );

        return result.rows[0];

    }

    static async create(data) {

        const result = await db.query(

            `
            INSERT INTO marega.payments
            (
                tenant_id,
                lease_id,
                payment_month,
                amount,
                payment_date,
                payment_method,
                reference,
                status,
                notes
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9
            )

            RETURNING *
            `,

            [

                data.tenant_id,
                data.lease_id,
                data.payment_month,
                data.amount,
                data.payment_date,
                data.payment_method,
                data.reference,
                data.status,
                data.notes

            ]

        );

        return result.rows[0];

    }

    static async update(id, data) {

        const result = await db.query(

            `
            UPDATE marega.payments

            SET

                tenant_id=$1,
                lease_id=$2,
                payment_month=$3,
                amount=$4,
                payment_date=$5,
                payment_method=$6,
                reference=$7,
                status=$8,
                notes=$9,
                updated_at=CURRENT_TIMESTAMP

            WHERE id=$10

            RETURNING *

            `,

            [

                data.tenant_id,
                data.lease_id,
                data.payment_month,
                data.amount,
                data.payment_date,
                data.payment_method,
                data.reference,
                data.status,
                data.notes,
                id

            ]

        );

        return result.rows[0];

    }

    static async delete(id) {

        await db.query(

            `
            DELETE FROM marega.payments

            WHERE id=$1
            `,

            [id]

        );

        return true;

    }

    static async updateReceiptPath(id, receiptPath) {

        await db.query(

            `
            UPDATE marega.payments

            SET
                receipt_path = $1

            WHERE id = $2
            `,

            [
                receiptPath,
                id
            ]

        );

    }

    static async getCompleteById(id) {

        const result = await db.query(

            `
            SELECT

                p.*,

                p.payment_month,
                p.payment_month AS month,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                l.contract_number,

                a.number AS apartment_number,
                a.type,
                a.rent,

                b.name AS building_name,
                b.address

            FROM marega.payments p

            JOIN marega.tenants t
                ON t.id = p.tenant_id

            LEFT JOIN marega.leases l
                ON l.id = p.lease_id

            LEFT JOIN marega.apartments a
                ON a.id = l.apartment_id

            LEFT JOIN marega.buildings b
                ON b.id = a.building_id

            WHERE p.id = $1
            `,

            [id]

        );

        return result.rows[0];

    }

}

module.exports = Payment;