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
                b.city AS building_city,
                b.country AS building_country,

                -- =================================================
                -- BAILLEUR
                -- =================================================

                lnd.id AS landlord_id,
                lnd.first_name AS landlord_first_name,
                lnd.last_name AS landlord_last_name,
                lnd.company_name AS landlord_company_name,
                lnd.phone AS landlord_phone,
                lnd.email AS landlord_email,
                lnd.address AS landlord_address,
                lnd.identity_number AS landlord_identity_number,

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
            -- BAILLEUR
            -- =====================================================

            LEFT JOIN marega.landlords lnd
                ON lnd.id = b.landlord_id
            AND lnd.agency_id = l.agency_id

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


        const result =
            await db.query(

                `
                SELECT

                    COALESCE(

                        MAX(

                            (
                                SUBSTRING(
                                    contract_number
                                    FROM
                                    '^MRG-[0-9]{4}-([0-9]+)$'
                                )
                            )::INTEGER

                        ),

                        0

                    ) + 1 AS next_number

                FROM marega.leases

                WHERE agency_id = $1

                AND contract_number LIKE $2
                `,

                [
                    agencyId,
                    `MRG-${year}-%`
                ]

            );


        const nextNumber =
            Number(
                result.rows[0].next_number
            );


        return (
            `MRG-${year}-` +
            String(nextNumber).padStart(
                6,
                "0"
            )
        );

    }

    // =========================================================
    // VÉRIFICATION CHEVAUCHEMENT DES CONTRATS ACTIFS
    // =========================================================

    static async checkActiveOverlap(
        apartmentId,
        startDate,
        endDate,
        agencyId,
        excludeId = null
    ) {

        // -----------------------------------------------------
        // DATES OBLIGATOIRES
        // -----------------------------------------------------

        if (!startDate || !endDate) {

            const error =
                new Error(
                    "Les dates de début et de fin du contrat sont obligatoires."
                );

            error.code =
                "INVALID_LEASE_DATES";

            throw error;

        }


        // -----------------------------------------------------
        // COHÉRENCE DES DATES
        // -----------------------------------------------------

        if (
            String(startDate) >
            String(endDate)
        ) {

            const error =
                new Error(
                    "La date de début du contrat doit être antérieure ou égale à la date de fin."
                );

            error.code =
                "INVALID_LEASE_DATES";

            throw error;

        }


        // -----------------------------------------------------
        // RECHERCHE D'UN CONTRAT ACTIF EN CONFLIT
        // -----------------------------------------------------

        const result =
            await db.query(

                `
                SELECT
                    id,
                    contract_number,
                    start_date,
                    end_date

                FROM marega.leases

                WHERE agency_id = $1

                AND apartment_id = $2

                AND status = 'Actif'

                AND start_date <= $4

                AND end_date >= $3

                AND (
                        $5::integer IS NULL
                        OR id <> $5
                )

                ORDER BY start_date ASC, id ASC

                LIMIT 1
                `,

                [
                    agencyId,
                    apartmentId,
                    startDate,
                    endDate,
                    excludeId
                ]

            );


        if (
            result.rows.length > 0
        ) {

            const conflict =
                result.rows[0];


            const error =
                new Error(
                    `L'appartement possède déjà un contrat actif sur cette période (${conflict.contract_number}).`
                );


            error.code =
                "LEASE_PERIOD_CONFLICT";


            error.conflictingLease =
                conflict;


            throw error;

        }

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
        // VÉRIFIER LE CHEVAUCHEMENT
        // -----------------------------------------------------

        if (data.status === "Actif") {

            await Lease.checkActiveOverlap(

                data.apartment_id,

                data.start_date,

                data.end_date,

                agencyId

            );

        }


        // -----------------------------------------------------
        // NUMÉRO DE CONTRAT
        // -----------------------------------------------------

        const contractNumber =
            await Lease.generateContractNumber(
                agencyId
            );


        
        // -----------------------------------------------------
        // CRÉATION AVEC RETRY EN CAS DE COLLISION
        // -----------------------------------------------------

        const MAX_ATTEMPTS = 5;


        for (
            let attempt = 1;
            attempt <= MAX_ATTEMPTS;
            attempt++
        ) {

            const contractNumber =
                await Lease.generateContractNumber(
                    agencyId
                );


            try {

                // -------------------------------------------------
                // INSERTION
                // -------------------------------------------------

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


                // -------------------------------------------------
                // SUCCÈS
                // -------------------------------------------------

                return result.rows[0];

            }

            catch (err) {

                // -------------------------------------------------
                // COLLISION DE NUMÉRO
                // -------------------------------------------------

                if (
                    err.code === "23505" &&
                    err.constraint ===
                        "leases_agency_contract_number_unique"
                ) {

                    console.warn(
                        `⚠️ Collision numéro de contrat : ${contractNumber} `
                        + `(tentative ${attempt}/${MAX_ATTEMPTS})`
                    );


                    if (
                        attempt <
                        MAX_ATTEMPTS
                    ) {

                        continue;

                    }


                    // -------------------------------------------------
                    // TROP DE COLLISIONS
                    // -------------------------------------------------

                    const error =
                        new Error(
                            "Impossible de générer un numéro de contrat unique après plusieurs tentatives."
                        );


                    error.code =
                        "CONTRACT_NUMBER_GENERATION_FAILED";


                    throw error;

                }


                // -------------------------------------------------
                // AUTRE ERREUR
                // -------------------------------------------------

                throw err;

            }

        }

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

        // -----------------------------------------------------
        // VÉRIFIER LE CHEVAUCHEMENT
        // -----------------------------------------------------

        if (data.status === "Actif") {

            await Lease.checkActiveOverlap(

                data.apartment_id,

                data.start_date,

                data.end_date,

                agencyId,

                id

            );

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