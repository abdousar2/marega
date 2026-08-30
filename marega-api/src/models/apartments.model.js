const pool = require("../config/database");


// =========================================================
// TOUS LES APPARTEMENTS DE L'AGENCE
// =========================================================

async function getAll(agencyId) {

    const result = await pool.query(
        `
        SELECT
            a.*,
            b.name AS building_name

        FROM marega.apartments a

        INNER JOIN marega.buildings b
            ON b.id = a.building_id

        WHERE
            a.agency_id = $1
            AND b.agency_id = $1

        ORDER BY a.id DESC
        `,
        [agencyId]
    );

    return result.rows;

}


// =========================================================
// UN APPARTEMENT
// =========================================================

async function getById(id, agencyId) {

    const result = await pool.query(
        `
        SELECT
            a.*,
            b.name AS building_name

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
            id,
            agencyId
        ]
    );

    return result.rows[0];

}


// =========================================================
// APPARTEMENTS D'UN IMMEUBLE
// =========================================================

async function getByBuilding(
    buildingId,
    agencyId
) {

    const result = await pool.query(
        `
        SELECT
            a.*

        FROM marega.apartments a

        INNER JOIN marega.buildings b
            ON b.id = a.building_id

        WHERE
            a.building_id = $1
            AND a.agency_id = $2
            AND b.agency_id = $2

        ORDER BY a.number
        `,
        [
            buildingId,
            agencyId
        ]
    );

    return result.rows;

}


// =========================================================
// CRÉATION
// =========================================================

async function create(
    apartment,
    agencyId
) {

    const {

        building_id,
        number,
        floor,
        type,
        surface,
        rent,
        charges,
        deposit,
        status,
        description

    } = apartment;


    // ---------------------------------------------------------
    // Vérifier que l'immeuble appartient à l'agence
    // ---------------------------------------------------------

    const buildingResult =
        await pool.query(
            `
            SELECT
                id

            FROM marega.buildings

            WHERE
                id = $1
                AND agency_id = $2

            LIMIT 1
            `,
            [
                building_id,
                agencyId
            ]
        );


    if (buildingResult.rows.length === 0) {

        throw new Error(
            "L'immeuble sélectionné n'appartient pas à votre agence."
        );

    }


    // ---------------------------------------------------------
    // Création de l'appartement
    // ---------------------------------------------------------

    const result = await pool.query(
        `
        INSERT INTO marega.apartments
        (
            agency_id,
            building_id,
            number,
            floor,
            type,
            surface,
            rent,
            charges,
            deposit,
            status,
            description
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
            $11
        )

        RETURNING *
        `,
        [

            agencyId,
            building_id,
            number,
            floor,
            type,
            surface,
            rent,
            charges,
            deposit,
            status,
            description

        ]
    );

    return result.rows[0];

}


// =========================================================
// MODIFICATION
// =========================================================

async function update(
    id,
    apartment,
    agencyId
) {

    const {

        building_id,
        number,
        floor,
        type,
        surface,
        rent,
        charges,
        deposit,
        status,
        description

    } = apartment;


    // ---------------------------------------------------------
    // Vérifier que l'appartement appartient à l'agence
    // ---------------------------------------------------------

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
                id,
                agencyId
            ]
        );


    if (apartmentResult.rows.length === 0) {

        return null;

    }


    // ---------------------------------------------------------
    // Vérifier le nouvel immeuble
    // ---------------------------------------------------------

    const buildingResult =
        await pool.query(
            `
            SELECT
                id

            FROM marega.buildings

            WHERE
                id = $1
                AND agency_id = $2

            LIMIT 1
            `,
            [
                building_id,
                agencyId
            ]
        );


    if (buildingResult.rows.length === 0) {

        throw new Error(
            "L'immeuble sélectionné n'appartient pas à votre agence."
        );

    }


    // ---------------------------------------------------------
    // Modification
    // ---------------------------------------------------------

    const result = await pool.query(
        `
        UPDATE marega.apartments

        SET

            building_id = $1,
            number = $2,
            floor = $3,
            type = $4,
            surface = $5,
            rent = $6,
            charges = $7,
            deposit = $8,
            status = $9,
            description = $10,
            updated_at = NOW()

        WHERE
            id = $11
            AND agency_id = $12

        RETURNING *
        `,
        [

            building_id,
            number,
            floor,
            type,
            surface,
            rent,
            charges,
            deposit,
            status,
            description,
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
        DELETE FROM marega.apartments

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
    getByBuilding,
    create,
    update,
    remove

};