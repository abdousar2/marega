const pool = require("../config/database");

async function getAll() {

    const result = await pool.query(`
        SELECT
            a.*,
            b.name AS building_name
        FROM marega.apartments a
        JOIN marega.buildings b
            ON b.id = a.building_id
        ORDER BY a.id DESC
    `);

    return result.rows;

}

async function getById(id) {

    const result = await pool.query(
        `
        SELECT *
        FROM marega.apartments
        WHERE id=$1
        `,
        [id]
    );

    return result.rows[0];

}

async function getByBuilding(buildingId) {

    const result = await pool.query(
        `
        SELECT *
        FROM marega.apartments
        WHERE building_id=$1
        ORDER BY number
        `,
        [buildingId]
    );

    return result.rows;

}

async function create(apartment) {

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

    const result = await pool.query(
        `
        INSERT INTO marega.apartments
        (
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
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )

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
            description
        ]
    );

    return result.rows[0];

}

async function update(id, apartment) {

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

    const result = await pool.query(

        `
        UPDATE marega.apartments

        SET
            building_id=$1,
            number=$2,
            floor=$3,
            type=$4,
            surface=$5,
            rent=$6,
            charges=$7,
            deposit=$8,
            status=$9,
            description=$10,
            updated_at=NOW()

        WHERE id=$11

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
            id
        ]

    );

    return result.rows[0];

}

async function remove(id) {

    await pool.query(

        `
        DELETE FROM marega.apartments
        WHERE id=$1
        `,

        [id]

    );

}

module.exports = {

    getAll,
    getById,
    getByBuilding,
    create,
    update,
    remove

};