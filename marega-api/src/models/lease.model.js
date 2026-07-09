const db = require("../config/database");
class Lease {

    static async getAll() {

        const result = await db.query(
            `SELECT *
             FROM marega.leases
             ORDER BY created_at DESC`
        );

        return result.rows;

    }

    static async getById(id) {

        const result = await db.query(
            `SELECT *
             FROM marega.leases
             WHERE id = $1`,
            [id]
        );

        return result.rows[0];

    }

    static async create(data) {

        const result = await db.query(

            `INSERT INTO marega.leases
            (
                apartment_id,
                tenant_id,
                contract_number,
                start_date,
                end_date,
                monthly_rent,
                charges,
                deposit,
                payment_day,
                status,
                notes
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
            )

            RETURNING *`,

            [
                data.apartment_id,
                data.tenant_id,
                data.contract_number,
                data.start_date,
                data.end_date,
                data.monthly_rent,
                data.charges,
                data.deposit,
                data.payment_day,
                data.status,
                data.notes
            ]

        );

        return result.rows[0];

    }

    static async update(id, data) {

        const result = await db.query(

            `UPDATE marega.leases

            SET

                apartment_id = $1,
                tenant_id = $2,
                contract_number = $3,
                start_date = $4,
                end_date = $5,
                monthly_rent = $6,
                charges = $7,
                deposit = $8,
                payment_day = $9,
                status = $10,
                notes = $11,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $12

            RETURNING *`,

            [
                data.apartment_id,
                data.tenant_id,
                data.contract_number,
                data.start_date,
                data.end_date,
                data.monthly_rent,
                data.charges,
                data.deposit,
                data.payment_day,
                data.status,
                data.notes,
                id
            ]

        );

        return result.rows[0];

    }

    static async delete(id) {

        await db.query(

            `DELETE FROM marega.leases
             WHERE id = $1`,

            [id]

        );

        return true;

    }

}

module.exports = Lease;