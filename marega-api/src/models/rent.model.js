const db = require("../config/database");

class Rent {

    static async getAll() {

        const result = await db.query(`

            SELECT

                r.*,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                l.contract_number

            FROM marega.rents r

            JOIN marega.tenants t
                ON t.id = r.tenant_id

            JOIN marega.leases l
                ON l.id = r.lease_id

            ORDER BY
                r.due_month DESC,
                r.id DESC

        `);

        return result.rows;

    }

    static async getById(id) {

        const result = await db.query(

            `
            SELECT

                r.*,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                l.contract_number

            FROM marega.rents r

            JOIN marega.tenants t
                ON t.id = r.tenant_id

            JOIN marega.leases l
                ON l.id = r.lease_id

            WHERE r.id=$1
            `,

            [id]

        );

        return result.rows[0];

    }

    static async create(data) {

        const result = await db.query(

            `
            INSERT INTO marega.rents
            (
                lease_id,
                tenant_id,
                due_month,
                due_date,
                amount,
                status
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6
            )

            RETURNING *
            `,

            [

                data.lease_id,
                data.tenant_id,
                data.due_month,
                data.due_date,
                data.amount,
                data.status || "En attente"

            ]

        );

        return result.rows[0];

    }

    static async markAsPaid(rentId, paymentId) {

        await db.query(

            `
            UPDATE marega.rents

            SET

                status = 'Payé',

                payment_id = $1,

                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2
            `,

            [

                paymentId,
                rentId

            ]

        );

    }

        static async markAsUnpaidByPayment(paymentId) {

            const result = await db.query(

                `
                UPDATE marega.rents

                SET

                    status = 'Impayé',

                    payment_id = NULL,

                    updated_at = CURRENT_TIMESTAMP

                WHERE payment_id = $1

                RETURNING *
                `,

                [
                    paymentId
                ]

            );

            return result.rows[0];

        }

    static async getPending() {

        const result = await db.query(

            `
            SELECT *

            FROM marega.rents

            WHERE status <> 'Payé'

            ORDER BY due_date ASC
            `

        );

        return result.rows;

    }

    static async getLate() {

        const result = await db.query(

            `
            SELECT *

            FROM marega.rents

            WHERE

                due_date < CURRENT_DATE

                AND status <> 'Payé'

            ORDER BY due_date ASC
            `

        );

        return result.rows;

    }

    // =========================================================
    // VÉRIFIER SI UN CONTRAT POSSÈDE DES PAIEMENTS
    // =========================================================

    static async hasPayments(leaseId) {

        const result = await db.query(

            `
            SELECT EXISTS (

                SELECT 1

                FROM marega.rents r

                INNER JOIN marega.payments p
                    ON p.id = r.payment_id

                WHERE r.lease_id = $1

            ) AS has_payments
            `,

            [leaseId]

        );

        return result.rows[0].has_payments;

    }

        // =========================================================
    // SYNCHRONISATION DES LOYERS NON PAYÉS
    // =========================================================

    static async syncUnpaidFromLease(lease) {

        const result = await db.query(

            `
            UPDATE marega.rents

            SET

                tenant_id = $1,
                amount = $2,
                updated_at = CURRENT_TIMESTAMP

            WHERE lease_id = $3

              AND payment_id IS NULL

              AND status <> 'Payé'

            RETURNING *

            `,

            [
                lease.tenant_id,
                lease.monthly_rent,
                lease.id
            ]

        );

        return result.rows;

    }

    static async generateFromLease(lease) {

        const start = new Date(lease.start_date);

        const end = new Date(lease.end_date);

        let current = new Date(start);

        while (current <= end) {

            const dueMonth =
                current.toISOString().substring(0, 10);

            const dueDate =
                new Date(current);

            await db.query(

                `
                INSERT INTO marega.rents
                (
                    lease_id,
                    tenant_id,
                    due_month,
                    due_date,
                    amount,
                    status
                )

                VALUES
                (
                    $1,$2,$3,$4,$5,$6
                )
                `,

                [

                    lease.id,
                    lease.tenant_id,
                    dueMonth,
                    dueDate,
                    lease.monthly_rent,
                    "Impayé"

                ]

            );

            current.setMonth(
                current.getMonth() + 1
            );

        }

    }

}

module.exports = Rent;