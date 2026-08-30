const pool = require("../config/database");


// =========================================================
// TOUS LES LOCATAIRES DE L'AGENCE
// =========================================================

async function getAll(agencyId) {

    const result = await pool.query(
        `
        SELECT
            t.*,
            a.number AS apartment_number,
            b.name AS building_name

        FROM marega.tenants t

        INNER JOIN marega.apartments a
            ON a.id = t.apartment_id

        INNER JOIN marega.buildings b
            ON b.id = a.building_id

        WHERE
            t.agency_id = $1
            AND a.agency_id = $1
            AND b.agency_id = $1

        ORDER BY t.id DESC
        `,
        [agencyId]
    );

    return result.rows;

}


// =========================================================
// LOCATAIRE PAR ID
// =========================================================

async function getById(
    id,
    agencyId
) {

    const result = await pool.query(
        `
        SELECT
            t.*,
            a.number AS apartment_number,
            b.name AS building_name

        FROM marega.tenants t

        INNER JOIN marega.apartments a
            ON a.id = t.apartment_id

        INNER JOIN marega.buildings b
            ON b.id = a.building_id

        WHERE
            t.id = $1
            AND t.agency_id = $2
            AND a.agency_id = $2
            AND b.agency_id = $2

        LIMIT 1
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

async function create(
    tenant,
    agencyId
) {

    const {

        apartment_id,
        first_name,
        last_name,
        phone,
        email,
        id_type,
        id_number,
        profession,
        employer,
        emergency_contact,
        emergency_phone,
        entry_date,
        exit_date,
        deposit,
        status,
        notes

    } = tenant;


    // =====================================================
    // VÉRIFIER L'APPARTEMENT
    // =====================================================

    const apartmentResult =
        await pool.query(
            `
            SELECT
                a.id,
                a.agency_id,
                b.agency_id AS building_agency_id

            FROM marega.apartments a

            INNER JOIN marega.buildings b
                ON b.id = a.building_id

            WHERE
                a.id = $1
                AND a.agency_id = $2
                AND b.agency_id = $2

            LIMIT 1
            `,
            [
                apartment_id,
                agencyId
            ]
        );


    if (apartmentResult.rows.length === 0) {

        throw new Error(
            "L'appartement sélectionné n'appartient pas à votre agence."
        );

    }


    // =====================================================
    // CRÉATION DU LOCATAIRE
    // =====================================================

    const result = await pool.query(
        `
        INSERT INTO marega.tenants
        (
            agency_id,
            apartment_id,
            first_name,
            last_name,
            phone,
            email,
            id_type,
            id_number,
            profession,
            employer,
            emergency_contact,
            emergency_phone,
            entry_date,
            exit_date,
            deposit,
            status,
            notes
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17
        )

        RETURNING *
        `,
        [

            agencyId,
            apartment_id,
            first_name,
            last_name,
            phone,
            email,
            id_type,
            id_number,
            profession,
            employer,
            emergency_contact,
            emergency_phone,
            entry_date,
            exit_date,
            deposit,
            status,
            notes

        ]
    );

    return result.rows[0];

}


// =========================================================
// MODIFICATION
// =========================================================

async function update(
    id,
    tenant,
    agencyId
) {

    const {

        apartment_id,
        first_name,
        last_name,
        phone,
        email,
        id_type,
        id_number,
        profession,
        employer,
        emergency_contact,
        emergency_phone,
        entry_date,
        exit_date,
        deposit,
        status,
        notes

    } = tenant;


    // =====================================================
    // VÉRIFIER LE LOCATAIRE
    // =====================================================

    const tenantResult =
        await pool.query(
            `
            SELECT
                id

            FROM marega.tenants

            WHERE
                id = $1
                AND agency_id = $2

            LIMIT 1
            `,
            [
                id,
                agencyId
            ]
        );


    if (tenantResult.rows.length === 0) {

        return null;

    }


    // =====================================================
    // VÉRIFIER LE NOUVEL APPARTEMENT
    // =====================================================

    const apartmentResult =
        await pool.query(
            `
            SELECT
                a.id

            FROM marega.apartments a

            INNER JOIN marega.buildings b
                ON b.id = a.building_id

            WHERE
                a.id = $1
                AND a.agency_id = $2
                AND b.agency_id = $2

            LIMIT 1
            `,
            [
                apartment_id,
                agencyId
            ]
        );


    if (apartmentResult.rows.length === 0) {

        throw new Error(
            "L'appartement sélectionné n'appartient pas à votre agence."
        );

    }


    // =====================================================
    // MODIFICATION
    // =====================================================

    const result = await pool.query(
        `
        UPDATE marega.tenants

        SET

            apartment_id = $1,
            first_name = $2,
            last_name = $3,
            phone = $4,
            email = $5,
            id_type = $6,
            id_number = $7,
            profession = $8,
            employer = $9,
            emergency_contact = $10,
            emergency_phone = $11,
            entry_date = $12,
            exit_date = $13,
            deposit = $14,
            status = $15,
            notes = $16,
            updated_at = NOW()

        WHERE
            id = $17
            AND agency_id = $18

        RETURNING *
        `,
        [

            apartment_id,
            first_name,
            last_name,
            phone,
            email,
            id_type,
            id_number,
            profession,
            employer,
            emergency_contact,
            emergency_phone,
            entry_date,
            exit_date,
            deposit,
            status,
            notes,
            id,
            agencyId

        ]
    );

    return result.rows[0];

}


// =========================================================
// SUPPRESSION
// =========================================================

async function remove(
    id,
    agencyId
) {

    const result = await pool.query(
        `
        DELETE FROM marega.tenants

        WHERE
            id = $1
            AND agency_id = $2

        RETURNING id
        `,
        [
            id,
            agencyId
        ]
    );

    return result.rows[0];

}


module.exports = {

    getAll,
    getById,
    create,
    update,
    remove

};