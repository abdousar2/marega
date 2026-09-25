const db = require("../config/database");

class Rent {

    static async getAll(agencyId) {

        const result = await db.query(`

            SELECT

                r.*,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                l.contract_number,

                CASE

                    WHEN
                        r.status = 'Payé'
                        OR r.payment_id IS NOT NULL
                    THEN 'Payé'

                    WHEN
                        r.due_date::date < CURRENT_DATE
                    THEN 'En retard'

                    WHEN
                        r.due_date::date = CURRENT_DATE
                    THEN 'À échéance aujourd''hui'

                    ELSE 'En attente'

                END AS business_status

            FROM marega.rents r

            JOIN marega.tenants t
                ON t.id = r.tenant_id

            JOIN marega.leases l
                ON l.id = r.lease_id

            WHERE
                r.agency_id = $1

            ORDER BY
                r.due_month DESC,
                r.id DESC

        `, [

            agencyId

        ]);

        return result.rows;

    }


    static async getById(id, agencyId) {

        const result = await db.query(

            `
            SELECT

                r.*,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                l.contract_number,

                CASE

                    WHEN
                        r.status = 'Payé'
                        OR r.payment_id IS NOT NULL
                    THEN 'Payé'

                    WHEN
                        r.due_date::date < CURRENT_DATE
                    THEN 'En retard'

                    WHEN
                        r.due_date::date = CURRENT_DATE
                    THEN 'À échéance aujourd''hui'

                    ELSE 'En attente'

                END AS business_status

            FROM marega.rents r

            JOIN marega.tenants t
                ON t.id = r.tenant_id

            JOIN marega.leases l
                ON l.id = r.lease_id

            WHERE
                r.id = $1

                AND r.agency_id = $2

            `,

            [
                id,
                agencyId
            ]

        );

        return result.rows[0];

    }
    

    static async create(data) {

        const result = await db.query(

            `
            INSERT INTO marega.rents
            (
                agency_id,
                lease_id,
                tenant_id,
                due_month,
                due_date,
                amount,
                status
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7
            )

            RETURNING *
            `,

            [

                data.agency_id,
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

    static async markAsPaid(
        rentId,
        paymentId,
        agencyId,
        client = db
    ) {

        const result =
            await client.query(

                `
                UPDATE marega.rents

                SET
                    status = 'Payé',
                    payment_id = $1,
                    updated_at = CURRENT_TIMESTAMP

                WHERE
                    id = $2

                    AND agency_id = $3

                    AND status <> 'Payé'

                    AND payment_id IS NULL

                RETURNING *
                `,

                [
                    paymentId,
                    rentId,
                    agencyId
                ]

            );

        return result.rows[0];

    }

    static async getByIdForPayment(
        rentId,
        agencyId
    ) {

        const result =
            await db.query(

                `
                SELECT
                    *
                FROM marega.rents

                WHERE
                    id = $1

                    AND agency_id = $2
                `,

                [
                    rentId,
                    agencyId
                ]

            );

        return result.rows[0];

    }
    

    static async markAsUnpaidByPayment(
        paymentId,
        agencyId
    ) {

        const result = await db.query(

            `
            UPDATE marega.rents

            SET
                status = 'Impayé',
                payment_id = NULL,
                updated_at = CURRENT_TIMESTAMP

            WHERE
                payment_id = $1

                AND agency_id = $2

            RETURNING *
            `,

            [
                paymentId,
                agencyId
            ]

        );

        return result.rows[0];

    }

    static async getPending(agencyId) {

        const result = await db.query(

            `
            SELECT

                r.*,

                CASE

                    WHEN
                        r.status = 'Payé'
                        OR r.payment_id IS NOT NULL
                    THEN 'Payé'

                    WHEN
                        r.due_date::date < CURRENT_DATE
                    THEN 'En retard'

                    WHEN
                        r.due_date::date = CURRENT_DATE
                    THEN 'À échéance aujourd''hui'

                    ELSE 'En attente'

                END AS business_status

            FROM marega.rents r

            WHERE
                r.agency_id = $1

                AND r.status <> 'Payé'

                AND r.payment_id IS NULL

                AND r.due_date::date >= CURRENT_DATE

            ORDER BY
                r.due_date ASC

            `,

            [
                agencyId
            ]

        );

        return result.rows;

    }


    static async getLate(agencyId) {

        const result = await db.query(

            `
            SELECT

                r.*,

                CASE

                    WHEN
                        r.status = 'Payé'
                        OR r.payment_id IS NOT NULL
                    THEN 'Payé'

                    WHEN
                        r.due_date::date < CURRENT_DATE
                    THEN 'En retard'

                    WHEN
                        r.due_date::date = CURRENT_DATE
                    THEN 'À échéance aujourd''hui'

                    ELSE 'En attente'

                END AS business_status

            FROM marega.rents r

            WHERE
                r.agency_id = $1

                AND r.status <> 'Payé'

                AND r.payment_id IS NULL

                AND r.due_date::date < CURRENT_DATE

            ORDER BY
                r.due_date ASC

            `,

            [
                agencyId
            ]

        );

        return result.rows;

    }

    // =========================================================
    // VÉRIFIER SI UN CONTRAT POSSÈDE DES PAIEMENTS
    // =========================================================

    static async hasPayments(
        leaseId,
        agencyId
    ) {

        const result = await db.query(

            `
            SELECT EXISTS (

                SELECT 1

                FROM marega.rents r

                INNER JOIN marega.payments p

                    ON p.id = r.payment_id

                    AND p.agency_id = r.agency_id

                WHERE
                    r.lease_id = $1

                    AND r.agency_id = $2

            ) AS has_payments
            `,

            [
                leaseId,
                agencyId
            ]

        );

        return result.rows[0].has_payments;

    }

    // =========================================================
    // SYNCHRONISATION DES LOYERS APRÈS MODIFICATION DU BAIL
    // =========================================================

    static async syncUnpaidFromLease(
        lease,
        agencyId
    ) {

        const schedule =
            Rent.buildRentSchedule(lease);


        // -----------------------------------------------------
        // PROTECTION ABSOLUE
        // -----------------------------------------------------

        if (!schedule.length) {

            const error =
                new Error(
                    "Impossible de synchroniser les loyers : le calendrier du contrat est vide."
                );

            error.code =
                "EMPTY_RENT_SCHEDULE";

            throw error;

        }


        const client =
            await db.connect();


        try {

            await client.query("BEGIN");


            // =================================================
            // 1. CRÉER / METTRE À JOUR LES LOYERS NON PAYÉS
            // =================================================

            for (const item of schedule) {

                await client.query(

                    `
                    INSERT INTO marega.rents
                    (
                        agency_id,
                        lease_id,
                        tenant_id,
                        due_month,
                        due_date,
                        amount,
                        status
                    )

                    VALUES
                    (
                        $1,$2,$3,$4,$5,$6,$7
                    )

                    ON CONFLICT (
                        lease_id,
                        due_month
                    )

                    DO UPDATE SET

                        tenant_id =
                            EXCLUDED.tenant_id,

                        due_date =
                            EXCLUDED.due_date,

                        amount =
                            EXCLUDED.amount,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE
                        marega.rents.payment_id IS NULL
                    `,

                    [

                        agencyId,

                        lease.id,

                        lease.tenant_id,

                        item.dueMonth,

                        item.dueDate,

                        lease.monthly_rent,

                        "Impayé"

                    ]

                );

            }


            // =================================================
            // 2. MOIS AUTORISÉS
            // =================================================

            const dueMonths =
                schedule.map(
                    item =>
                        item.dueMonth
                );


            // =================================================
            // 3. SUPPRIMER UNIQUEMENT LES LOYERS NON PAYÉS
            //    QUI NE FONT PLUS PARTIE DU CONTRAT
            // =================================================

            await client.query(

                `
                DELETE FROM marega.rents

                WHERE
                    lease_id = $1

                    AND agency_id = $2

                    AND payment_id IS NULL

                    AND NOT (
                        due_month = ANY(
                            $3::date[]
                        )
                    )
                `,

                [

                    lease.id,

                    agencyId,

                    dueMonths

                ]

            );


            await client.query(
                "COMMIT"
            );


            // =================================================
            // 4. RETOUR FINAL
            // =================================================

            const result =
                await db.query(

                    `
                    SELECT *

                    FROM marega.rents

                    WHERE
                        lease_id = $1

                        AND agency_id = $2

                    ORDER BY
                        due_month ASC
                    `,

                    [
                        lease.id,
                        agencyId
                    ]

                );


            return result.rows;

        }

        catch (err) {

            await client.query(
                "ROLLBACK"
            );

            throw err;

        }

        finally {

            client.release();

        }

    }

    // =========================================================
    // OUTILS CALENDRIER DES LOYERS
    // =========================================================

    static parseDateOnly(value) {

        // PostgreSQL / node-postgres peut retourner
        // les colonnes DATE sous forme d'objet Date.
        if (value instanceof Date) {

            if (isNaN(value.getTime())) {
                return new Date(NaN);
            }

            return new Date(
                Date.UTC(
                    value.getUTCFullYear(),
                    value.getUTCMonth(),
                    value.getUTCDate()
                )
            );
        }

        // Cas où la valeur arrive sous forme de chaîne :
        // "2026-10-01"
        const text = String(value).substring(0, 10);

        const [
            year,
            month,
            day
        ] = text
            .split("-")
            .map(Number);

        if (
            !Number.isFinite(year) ||
            !Number.isFinite(month) ||
            !Number.isFinite(day)
        ) {
            return new Date(NaN);
        }

        return new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    }


    static formatDateOnly(date) {

        return date
            .toISOString()
            .substring(0, 10);

    }


    static buildRentSchedule(lease) {

        const start =
            Rent.parseDateOnly(
                lease.start_date
            );

        const end =
            Rent.parseDateOnly(
                lease.end_date
            );

        const paymentDay =
            Math.min(
                Math.max(
                    Number(
                        lease.payment_day || 1
                    ),
                    1
                ),
                31
            );


        const schedule = [];


        // =====================================================
        // PREMIÈRE ÉCHÉANCE
        // =====================================================

        let year =
            start.getUTCFullYear();

        let month =
            start.getUTCMonth();


        let daysInMonth =
            new Date(
                Date.UTC(
                    year,
                    month + 1,
                    0
                )
            ).getUTCDate();


        let dueDay =
            Math.min(
                paymentDay,
                daysInMonth
            );


        let firstDueDate =
            new Date(
                Date.UTC(
                    year,
                    month,
                    dueDay
                )
            );


        // Règle B :
        // le premier paiement doit être STRICTEMENT
        // après la date de début du contrat.

        if (
            firstDueDate <= start
        ) {

            month += 1;

            if (month > 11) {

                month = 0;
                year += 1;

            }

            daysInMonth =
                new Date(
                    Date.UTC(
                        year,
                        month + 1,
                        0
                    )
                ).getUTCDate();


            dueDay =
                Math.min(
                    paymentDay,
                    daysInMonth
                );


            firstDueDate =
                new Date(
                    Date.UTC(
                        year,
                        month,
                        dueDay
                    )
                );

        }


        // =====================================================
        // GÉNÉRATION DES ÉCHÉANCES
        // =====================================================

        let currentDueDate =
            firstDueDate;


        while (
            currentDueDate <= end
        ) {

            const currentYear =
                currentDueDate.getUTCFullYear();

            const currentMonth =
                currentDueDate.getUTCMonth();


            const dueMonth =
                Rent.formatDateOnly(
                    new Date(
                        Date.UTC(
                            currentYear,
                            currentMonth,
                            1
                        )
                    )
                );


            const dueDate =
                Rent.formatDateOnly(
                    currentDueDate
                );


            schedule.push({

                dueMonth,

                dueDate

            });


            // Mois suivant

            let nextMonth =
                currentMonth + 1;

            let nextYear =
                currentYear;


            if (
                nextMonth > 11
            ) {

                nextMonth = 0;
                nextYear += 1;

            }


            const nextDaysInMonth =
                new Date(
                    Date.UTC(
                        nextYear,
                        nextMonth + 1,
                        0
                    )
                ).getUTCDate();


            const nextPaymentDay =
                Math.min(
                    paymentDay,
                    nextDaysInMonth
                );


            currentDueDate =
                new Date(
                    Date.UTC(
                        nextYear,
                        nextMonth,
                        nextPaymentDay
                    )
                );

        }


        return schedule;

    }

    // =========================================================
    // GÉNÉRATION DES LOYERS À PARTIR DU CONTRAT
    // =========================================================

    static async generateFromLease(lease) {

        const schedule =
            Rent.buildRentSchedule(lease);


        // -----------------------------------------------------
        // PROTECTION
        // -----------------------------------------------------

        if (!schedule.length) {

            const error =
                new Error(
                    "Impossible de générer les loyers : le calendrier du contrat est vide."
                );

            error.code =
                "EMPTY_RENT_SCHEDULE";

            throw error;

        }


        for (const item of schedule) {

            await db.query(

                `
                INSERT INTO marega.rents
                (
                    agency_id,
                    lease_id,
                    tenant_id,
                    due_month,
                    due_date,
                    amount,
                    status
                )

                VALUES
                (
                    $1,$2,$3,$4,$5,$6,$7
                )

                ON CONFLICT (
                    lease_id,
                    due_month
                )

                DO UPDATE SET

                    tenant_id = EXCLUDED.tenant_id,

                    due_date = EXCLUDED.due_date,

                    amount = EXCLUDED.amount,

                    updated_at = CURRENT_TIMESTAMP

                WHERE
                    marega.rents.payment_id IS NULL
                `,

                [

                    lease.agency_id,

                    lease.id,

                    lease.tenant_id,

                    item.dueMonth,

                    item.dueDate,

                    lease.monthly_rent,

                    "Impayé"

                ]

            );

        }

    }   

}

module.exports = Rent;