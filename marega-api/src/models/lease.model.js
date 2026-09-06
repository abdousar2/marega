const db = require("../config/database");

class Lease {

    // =========================================================
    // TOUS LES CONTRATS DE L'AGENCE CONNECTÉE
    // =========================================================

    static async getAll(agencyId) {

        const result = await db.query(
            `
            SELECT *
            FROM marega.leases
            WHERE agency_id = $1
            ORDER BY created_at DESC
            `,
            [agencyId]
        );

        return result.rows;

    }


    // =========================================================
    // CONTRAT PAR ID + AGENCE
    // =========================================================

    static async getById(id, agencyId) {

        const result = await db.query(
            `
            SELECT *
            FROM marega.leases
            WHERE id = $1
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
    // CONTRAT COMPLET
    // =========================================================

    static async getCompleteById(id, agencyId) {

        const result = await db.query(

            `
            SELECT

                l.*,

                -- =================================================
                -- LOCATAIRE
                -- =================================================

                t.first_name,
                t.last_name,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                t.phone,
                t.email,
                t.profession,

                -- =================================================
                -- APPARTEMENT
                -- =================================================

                a.number AS apartment_number,
                a.type AS apartment_type,
                a.surface,
                a.rent AS apartment_rent,
                a.deposit,

                -- =================================================
                -- IMMEUBLE
                -- =================================================

                b.name AS building_name,
                b.address AS building_address,

                -- =================================================
                -- AGENCE
                -- =================================================

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

                -- =================================================
                -- DOCUMENTS DE L'AGENCE
                -- =================================================

                ag.logo_path AS agency_logo_path,
                ag.contract_template_path
                    AS agency_contract_template_path,
                ag.receipt_template_path
                    AS agency_receipt_template_path

            FROM marega.leases l

            -- =====================================================
            -- LOCATAIRE
            -- =====================================================

            JOIN marega.tenants t
                ON t.id = l.tenant_id

            -- =====================================================
            -- APPARTEMENT
            -- =====================================================

            JOIN marega.apartments a
                ON a.id = l.apartment_id

            -- =====================================================
            -- IMMEUBLE
            -- =====================================================

            JOIN marega.buildings b
                ON b.id = a.building_id

            -- =====================================================
            -- AGENCE
            -- =====================================================

            JOIN marega.agencies ag
                ON ag.id = l.agency_id

            WHERE

                l.id = $1

                AND l.agency_id = $2

                AND t.agency_id = l.agency_id
                AND a.agency_id = l.agency_id
                AND b.agency_id = l.agency_id
                AND ag.id = l.agency_id
            `,

            [
                id,
                agencyId
            ]

        );

        return result.rows[0];

    }

    // =========================================================
    // NUMÉRO DE CONTRAT
    // =========================================================

    static async generateContractNumber(agencyId) {

        const year =
            new Date().getFullYear();

        const result = await db.query(

            `
            SELECT contract_number

            FROM marega.leases

            WHERE contract_number LIKE $1
              AND agency_id = $2

            ORDER BY id DESC

            LIMIT 1
            `,

            [
                `MRG-${year}-%`,
                agencyId
            ]

        );

        let next = 1;

        if (result.rows.length > 0) {

            const last =
                result.rows[0].contract_number;

            const lastNumber =
                parseInt(
                    last.split("-")[2],
                    10
                );

            next =
                lastNumber + 1;

        }

        return `MRG-${year}-${String(next).padStart(6, "0")}`;

    }


    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(data, agencyId) {

        // -----------------------------------------------------
        // VÉRIFICATION APPARTEMENT + LOCATAIRE
        // -----------------------------------------------------

        const relation =
            await db.query(

                `
                SELECT

                    a.id AS apartment_id,
                    a.agency_id AS apartment_agency_id,

                    t.id AS tenant_id,
                    t.agency_id AS tenant_agency_id

                FROM marega.apartments a

                INNER JOIN marega.tenants t
                    ON t.id = $2

                WHERE a.id = $1

                  AND a.agency_id = $3
                  AND t.agency_id = $3
                `,

                [
                    data.apartment_id,
                    data.tenant_id,
                    agencyId
                ]

            );


        if (relation.rows.length === 0) {

            const error =
                new Error(
                    "L'appartement ou le locataire n'appartient pas à votre agence."
                );

            error.code =
                "AGENCY_MISMATCH";

            throw error;

        }


        // -----------------------------------------------------
        // NUMÉRO DE CONTRAT
        // -----------------------------------------------------

        const contractNumber =
            await Lease.generateContractNumber(
                agencyId
            );


        // -----------------------------------------------------
        // CRÉATION
        // -----------------------------------------------------

        const result =
            await db.query(

                `
                INSERT INTO marega.leases
                (
                    agency_id,
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
                    notes,
                    identity_number,
                    level
                )

                VALUES
                (
                    $1,$2,$3,$4,$5,$6,$7,
                    $8,$9,$10,$11,$12,$13,$14
                )

                RETURNING *
                `,

                [

                    agencyId,

                    data.apartment_id,

                    data.tenant_id,

                    contractNumber,

                    data.start_date,

                    data.end_date,

                    data.monthly_rent,

                    data.charges,

                    data.deposit,

                    data.payment_day,

                    data.status,

                    data.notes,

                    data.identity_number,

                    data.level

                ]

            );


        return result.rows[0];

    }


    // =========================================================
    // MODIFICATION
    // =========================================================

    static async update(
        id,
        data,
        agencyId
    ) {

        // -----------------------------------------------------
        // VÉRIFIER APPARTEMENT + LOCATAIRE
        // -----------------------------------------------------

        const relation =
            await db.query(

                `
                SELECT

                    a.id AS apartment_id,
                    t.id AS tenant_id

                FROM marega.apartments a

                INNER JOIN marega.tenants t
                    ON t.id = $2

                WHERE a.id = $1

                  AND a.agency_id = $3
                  AND t.agency_id = $3
                `,

                [
                    data.apartment_id,
                    data.tenant_id,
                    agencyId
                ]

            );


        if (relation.rows.length === 0) {

            const error =
                new Error(
                    "L'appartement ou le locataire n'appartient pas à votre agence."
                );

            error.code =
                "AGENCY_MISMATCH";

            throw error;

        }


        const result =
            await db.query(

                `
                UPDATE marega.leases

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
                    identity_number = $12,
                    level = $13,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $14
                  AND agency_id = $15

                RETURNING *
                `,

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

                    data.identity_number,

                    data.level,

                    id,

                    agencyId

                ]

            );


        return result.rows[0];

    }


    // =========================================================
    // SUPPRESSION
    // =========================================================

    static async delete(
        id,
        agencyId
    ) {

        await db.query(

            `
            DELETE FROM marega.leases

            WHERE id = $1
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
    // PDF
    // =========================================================

    static async updatePdfPath(
        id,
        pdfPath,
        agencyId
    ) {

        await db.query(

            `
            UPDATE marega.leases

            SET

                pdf_path = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2
              AND agency_id = $3
            `,

            [
                pdfPath,
                id,
                agencyId
            ]

        );

    }

}

module.exports = Lease;