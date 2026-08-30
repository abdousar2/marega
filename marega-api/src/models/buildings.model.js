const pool = require("../config/database");


// =========================================================
// RÉCUPÉRER TOUS LES BÂTIMENTS D'UNE AGENCE
// =========================================================

async function getAll(agencyId) {

    const result = await pool.query(
        `
        SELECT *
        FROM marega.buildings
        WHERE agency_id = $1
        ORDER BY id DESC
        `,
        [agencyId]
    );

    return result.rows;
}


// =========================================================
// RÉCUPÉRER UN BÂTIMENT D'UNE AGENCE
// =========================================================

async function getById(id, agencyId) {

    const result = await pool.query(
        `
        SELECT *
        FROM marega.buildings
        WHERE id = $1
        AND agency_id = $2
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
// CRÉER UN BÂTIMENT
// =========================================================

async function create(building, agencyId) {

    const {
        code,
        name,
        address,
        city,
        country,
        floors,
        apartments_count,
        status,
        deliveryDate,
        description
    } = building;


    const result = await pool.query(
        `
        INSERT INTO marega.buildings
        (
            agency_id,
            code,
            name,
            address,
            city,
            country,
            floors,
            apartments_count,
            status,
            delivery_date,
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
            code,
            name,
            address,
            city,
            country,
            floors,
            apartments_count,
            status,
            deliveryDate,
            description
        ]
    );

    return result.rows[0];
}


// =========================================================
// MODIFIER UN BÂTIMENT
// =========================================================

async function update(id, building, agencyId) {

    const {
        name,
        address,
        city,
        country,
        floors,
        apartments_count,
        status,
        deliveryDate,
        description
    } = building;


    const result = await pool.query(
        `
        UPDATE marega.buildings

        SET
            name = $1,
            address = $2,
            city = $3,
            country = $4,
            floors = $5,
            apartments_count = $6,
            status = $7,
            delivery_date = $8,
            description = $9,
            updated_at = NOW()

        WHERE id = $10
        AND agency_id = $11

        RETURNING *
        `,
        [
            name,
            address,
            city,
            country,
            floors,
            apartments_count,
            status,
            deliveryDate,
            description,
            id,
            agencyId
        ]
    );

    return result.rows[0];
}


// =========================================================
// SUPPRIMER UN BÂTIMENT
// =========================================================

async function remove(id, agencyId) {

    const result = await pool.query(
        `
        DELETE
        FROM marega.buildings

        WHERE id = $1
        AND agency_id = $2

        RETURNING *
        `,
        [
            id,
            agencyId
        ]
    );

    return result.rows[0];
}


// =========================================================

module.exports = {

    getAll,
    getById,
    create,
    update,
    remove

};