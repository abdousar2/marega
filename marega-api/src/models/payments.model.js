const db = require("../config/database");

class Payment {

    // =========================================================
    // TOUS LES PAIEMENTS DE L'AGENCE
    // =========================================================

    static async getAll(agencyId) {

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

            WHERE p.agency_id = $1

            ORDER BY
                p.payment_month DESC,
                p.id DESC

        `, [

            agencyId

        ]);

        return result.rows;

    }


    // =========================================================
    // UN PAIEMENT DE L'AGENCE
    // =========================================================

    static async getById(id, agencyId) {

        const result = await db.query(

            `
            SELECT *

            FROM marega.payments

            WHERE
                id = $1

                AND agency_id = $2
            `,

            [
                id,
                agencyId
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(data, client = db) {

        const result = await client.query(

            `
            INSERT INTO marega.payments
            (
                agency_id,
                tenant_id,
                lease_id,
                payment_month,
                amount,
                payment_date,
                payment_method,
                reference,
                status,
                notes,
                cashier_user_id
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
            )

            RETURNING *
            `,

            [

                data.agency_id,
                data.tenant_id,
                data.lease_id,
                data.payment_month,
                data.amount,
                data.payment_date,
                data.payment_method,
                data.reference,
                data.status,
                data.notes,
                data.cashier_user_id

            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // MODIFICATION
    // =========================================================

    static async update(id, data, agencyId) {

        const result = await db.query(

            `
            UPDATE marega.payments

            SET

                tenant_id = $1,
                lease_id = $2,
                payment_month = $3,
                amount = $4,
                payment_date = $5,
                payment_method = $6,
                reference = $7,
                status = $8,
                notes = $9,
                updated_at = CURRENT_TIMESTAMP

            WHERE
                id = $10

                AND agency_id = $11

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
                id,
                agencyId

            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // SUPPRESSION
    // =========================================================

    static async delete(id, agencyId) {

        await db.query(

            `
            DELETE FROM marega.payments

            WHERE
                id = $1

                AND agency_id = $2
            `,

            [
                id,
                agencyId
            ]

        );

        return true;

    }


    // =========================================================
    // CHEMIN DU REÇU
    // =========================================================

    static async updateReceiptPath(
        id,
        receiptPath,
        agencyId
    ) {

        await db.query(

            `
            UPDATE marega.payments

            SET
                receipt_path = $1

            WHERE
                id = $2

                AND agency_id = $3
            `,

            [
                receiptPath,
                id,
                agencyId
            ]

        );

    }


    // =========================================================
    // PAIEMENT COMPLET
    // =========================================================

    // =========================================================
    // PAIEMENT COMPLET + INFORMATIONS DE L'AGENCE
    // =========================================================

    static async getCompleteById(
        id,
        agencyId
    ) {

        const result = await db.query(

            `
            SELECT

                p.*,

                p.payment_month,

                p.payment_month AS month,

                -- =============================================
                -- LOCATAIRE
                -- =============================================

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                t.phone AS tenant_phone,

                t.email AS tenant_email,

                -- =============================================
                -- CONTRAT
                -- =============================================

                l.contract_number,

                -- =============================================
                -- APPARTEMENT
                -- =============================================

                a.number AS apartment_number,

                a.type,

                a.rent,

                -- =============================================
                -- IMMEUBLE
                -- =============================================

                b.name AS building_name,

                b.address AS building_address,

                -- =============================================
                -- COMPTABLE
                -- =============================================

                CONCAT(
                    cashier.first_name,
                    ' ',
                    cashier.last_name
                ) AS cashier_name,

                cashier.role AS cashier_role,

                -- =============================================
                -- AGENCE
                -- =============================================

                ag.id AS agency_id,

                ag.name AS agency_name,

                ag.type AS agency_type,

                ag.city AS agency_city,

                ag.country AS agency_country,

                ag.address AS agency_address,

                ag.phone AS agency_phone,

                ag.email AS agency_email,

                ag.ninea AS agency_ninea,

                ag.rccm AS agency_rccm,

                ag.logo_path AS agency_logo_path,

                ag.contract_template_path
                    AS agency_contract_template_path,

                ag.receipt_template_path
                    AS agency_receipt_template_path

            FROM marega.payments p

            -- =============================================
            -- LOCATAIRE
            -- =============================================

            JOIN marega.tenants t
                ON t.id = p.tenant_id

            -- =============================================
            -- COMPTABLE
            -- =============================================

            LEFT JOIN marega.users cashier
                ON cashier.id = p.cashier_user_id

            -- =============================================
            -- CONTRAT
            -- =============================================

            LEFT JOIN marega.leases l
                ON l.id = p.lease_id

            -- =============================================
            -- APPARTEMENT
            -- =============================================

            LEFT JOIN marega.apartments a
                ON a.id = l.apartment_id

            -- =============================================
            -- IMMEUBLE
            -- =============================================

            LEFT JOIN marega.buildings b
                ON b.id = a.building_id

            -- =============================================
            -- AGENCE
            -- =============================================

            JOIN marega.agencies ag
                ON ag.id = p.agency_id

            WHERE

                p.id = $1

                AND p.agency_id = $2

            `,

            [
                id,
                agencyId
            ]

        );

        return result.rows[0];

    }

    static async validateAgencyRelations(
        agencyId,
        tenantId,
        leaseId,
        rentId = null
    ) {

        const result = await db.query(

            `
            SELECT

                t.id AS tenant_id,

                l.id AS lease_id,

                a.id AS apartment_id,

                b.id AS building_id,

                t.agency_id AS tenant_agency_id,

                l.agency_id AS lease_agency_id,

                a.agency_id AS apartment_agency_id,

                b.agency_id AS building_agency_id

            FROM marega.tenants t

            LEFT JOIN marega.leases l
                ON l.id = $2

            LEFT JOIN marega.apartments a
                ON a.id = l.apartment_id

            LEFT JOIN marega.buildings b
                ON b.id = a.building_id

            WHERE

                t.id = $1

                AND t.agency_id = $3

                AND l.agency_id = $3

                AND a.agency_id = $3

                AND b.agency_id = $3
            `,

            [
                tenantId,
                leaseId,
                agencyId
            ]

        );

        if (result.rows.length === 0) {

            return false;

        }

        // ---------------------------------------------------------
        // Vérification supplémentaire du loyer
        // ---------------------------------------------------------

        if (rentId) {

            const rentResult = await db.query(

                `
                SELECT id

                FROM marega.rents

                WHERE

                    id = $1

                    AND agency_id = $2

                    AND lease_id = $3

                    AND tenant_id = $4
                `,

                [
                    rentId,
                    agencyId,
                    leaseId,
                    tenantId
                ]

            );

            if (rentResult.rows.length === 0) {

                return false;

            }

        }

        return true;

    }

}

// =========================================================
// VÉRIFIER QUE LES ÉLÉMENTS APPARTIENNENT À L'AGENCE
// =========================================================



module.exports = Payment;