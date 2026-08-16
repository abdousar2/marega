const db = require("../config/database");

class Expense {

    static async getAll() {

        const result = await db.query(`

            SELECT

                e.*,

                b.name AS building_name,

                a.number AS apartment_number

            FROM marega.expenses e

            LEFT JOIN marega.buildings b
                ON b.id = e.building_id

            LEFT JOIN marega.apartments a
                ON a.id = e.apartment_id

            ORDER BY
                e.expense_date DESC,
                e.id DESC

        `);

        return result.rows;

    }

    static async getById(id) {

        const result = await db.query(

            `
            SELECT

                e.*,

                b.name AS building_name,

                a.number AS apartment_number

            FROM marega.expenses e

            LEFT JOIN marega.buildings b
                ON b.id = e.building_id

            LEFT JOIN marega.apartments a
                ON a.id = e.apartment_id

            WHERE e.id = $1
            `,

            [id]

        );

        return result.rows[0];

    }

    static async create(data) {

        const result = await db.query(

            `
            INSERT INTO marega.expenses
            (
                expense_date,
                label,
                category,
                amount,
                payment_method,
                beneficiary,
                reference,
                description,
                building_id,
                apartment_id
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
            )

            RETURNING *
            `,

            [
                data.expense_date,
                data.label,
                data.category,
                data.amount,
                data.payment_method,
                data.beneficiary,
                data.reference,
                data.description,
                data.building_id || null,
                data.apartment_id || null
            ]

        );

        return result.rows[0];

    }

    static async update(id, data) {

        const result = await db.query(

            `
            UPDATE marega.expenses

            SET

                expense_date =
                    COALESCE($1, expense_date),

                label =
                    COALESCE($2, label),

                category =
                    COALESCE($3, category),

                amount =
                    COALESCE($4, amount),

                payment_method =
                    COALESCE($5, payment_method),

                beneficiary =
                    COALESCE($6, beneficiary),

                reference =
                    COALESCE($7, reference),

                description =
                    COALESCE($8, description),

                building_id =
                    COALESCE($9, building_id),

                apartment_id =
                    COALESCE($10, apartment_id),

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = $11

            RETURNING *
            `,

            [

                data.expense_date ?? null,

                data.label ?? null,

                data.category ?? null,

                data.amount ?? null,

                data.payment_method ?? null,

                data.beneficiary ?? null,

                data.reference ?? null,

                data.description ?? null,

                data.building_id ?? null,

                data.apartment_id ?? null,

                id

            ]

        );

        return result.rows[0];

    }

    static async delete(id) {

        await db.query(

            `
            DELETE FROM marega.expenses
            WHERE id = $1
            `,

            [id]

        );

        return true;

    }

}

module.exports = Expense;