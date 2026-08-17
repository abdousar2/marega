const db = require("../config/database");


class Finance {

    // =========================================================
    // RAPPORT FINANCIER
    // =========================================================

    static async getReport(startDate, endDate) {

        // -----------------------------------------------------
        // ENCAISSEMENTS
        // -----------------------------------------------------

        const incomeResult = await db.query(

            `
            SELECT

                COALESCE(
                    SUM(p.amount),
                    0
                ) AS total,

                COUNT(p.id) AS count

            FROM marega.payments p

            WHERE p.status = 'Payé'

            AND p.payment_date >= $1

            AND p.payment_date < ($2::date + INTERVAL '1 day')
            `,

            [
                startDate,
                endDate
            ]

        );


        // -----------------------------------------------------
        // DÉPENSES
        // -----------------------------------------------------

        const expenseResult = await db.query(

            `
            SELECT

                COALESCE(
                    SUM(e.amount),
                    0
                ) AS total,

                COUNT(e.id) AS count

            FROM marega.expenses e

            WHERE e.expense_date >= $1

            AND e.expense_date < ($2::date + INTERVAL '1 day')
            `,

            [
                startDate,
                endDate
            ]

        );


        // -----------------------------------------------------
        // ENCAISSEMENTS PAR MOYEN DE PAIEMENT
        // -----------------------------------------------------

        const paymentMethodsResult = await db.query(

            `
            SELECT

                COALESCE(
                    p.payment_method,
                    'Non précisé'
                ) AS payment_method,

                COALESCE(
                    SUM(p.amount),
                    0
                ) AS total,

                COUNT(p.id) AS count

            FROM marega.payments p

            WHERE p.status = 'Payé'

            AND p.payment_date >= $1

            AND p.payment_date < ($2::date + INTERVAL '1 day')

            GROUP BY p.payment_method

            ORDER BY total DESC
            `,

            [
                startDate,
                endDate
            ]

        );


        // -----------------------------------------------------
        // ENCAISSEMENTS PAR COMPTABLE
        // -----------------------------------------------------

        const cashiersResult = await db.query(

            `
            SELECT

                p.cashier_user_id,

                CONCAT(
                    u.first_name,
                    ' ',
                    u.last_name
                ) AS cashier_name,

                u.role AS cashier_role,

                COALESCE(
                    SUM(p.amount),
                    0
                ) AS total,

                COUNT(p.id) AS count

            FROM marega.payments p

            LEFT JOIN marega.users u
                ON u.id = p.cashier_user_id

            WHERE p.status = 'Payé'

            AND p.payment_date >= $1

            AND p.payment_date < ($2::date + INTERVAL '1 day')

            GROUP BY

                p.cashier_user_id,
                u.first_name,
                u.last_name,
                u.role

            ORDER BY total DESC
            `,

            [
                startDate,
                endDate
            ]

        );


        // -----------------------------------------------------
        // DÉPENSES PAR CATÉGORIE
        // -----------------------------------------------------

        const expenseCategoriesResult = await db.query(

            `
            SELECT

                e.category,

                COALESCE(
                    SUM(e.amount),
                    0
                ) AS total,

                COUNT(e.id) AS count

            FROM marega.expenses e

            WHERE e.expense_date >= $1

            AND e.expense_date < ($2::date + INTERVAL '1 day')

            GROUP BY e.category

            ORDER BY total DESC
            `,

            [
                startDate,
                endDate
            ]

        );


        // -----------------------------------------------------
        // LISTE DES ENCAISSEMENTS
        // -----------------------------------------------------

        const paymentsResult = await db.query(

            `
            SELECT

                p.id,

                p.payment_date,

                p.payment_month,

                p.amount,

                p.payment_method,

                p.reference,

                p.status,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                CONCAT(
                    u.first_name,
                    ' ',
                    u.last_name
                ) AS cashier_name,

                u.role AS cashier_role,

                b.name AS building_name,

                a.number AS apartment_number

            FROM marega.payments p

            JOIN marega.tenants t
                ON t.id = p.tenant_id

            LEFT JOIN marega.users u
                ON u.id = p.cashier_user_id

            LEFT JOIN marega.leases l
                ON l.id = p.lease_id

            LEFT JOIN marega.apartments a
                ON a.id = l.apartment_id

            LEFT JOIN marega.buildings b
                ON b.id = a.building_id

            WHERE p.status = 'Payé'

            AND p.payment_date >= $1

            AND p.payment_date < ($2::date + INTERVAL '1 day')

            ORDER BY
                p.payment_date DESC,
                p.id DESC
            `,

            [
                startDate,
                endDate
            ]

        );


        // -----------------------------------------------------
        // LISTE DES DÉPENSES
        // -----------------------------------------------------

        const expensesResult = await db.query(

            `
            SELECT

                e.id,

                e.expense_date,

                e.label,

                e.category,

                e.amount,

                e.payment_method,

                e.beneficiary,

                e.reference,

                e.description,

                b.name AS building_name,

                a.number AS apartment_number

            FROM marega.expenses e

            LEFT JOIN marega.buildings b
                ON b.id = e.building_id

            LEFT JOIN marega.apartments a
                ON a.id = e.apartment_id

            WHERE e.expense_date >= $1

            AND e.expense_date < ($2::date + INTERVAL '1 day')

            ORDER BY
                e.expense_date DESC,
                e.id DESC
            `,

            [
                startDate,
                endDate
            ]

        );


        const income =
            Number(
                incomeResult.rows[0].total
            );


        const expenses =
            Number(
                expenseResult.rows[0].total
            );


        return {

            period: {

                start: startDate,

                end: endDate

            },

            income: {

                total: income,

                count:
                    Number(
                        incomeResult.rows[0].count
                    )

            },

            expenses: {

                total: expenses,

                count:
                    Number(
                        expenseResult.rows[0].count
                    )

            },

            net:
                income - expenses,

            paymentMethods:
                paymentMethodsResult.rows,

            cashiers:
                cashiersResult.rows,

            expenseCategories:
                expenseCategoriesResult.rows,

            payments:
                paymentsResult.rows,

            expenseList:
                expensesResult.rows

        };

    }

}


module.exports = Finance;