const pool = require("../config/database");

async function getAll() {

    const result = await pool.query(`
        SELECT *
        FROM marega.buildings
        ORDER BY id DESC
    `);

    return result.rows;
}

async function getById(id) {

    const result = await pool.query(
        `
        SELECT *
        FROM marega.buildings
        WHERE id=$1
        `,
        [id]
    );

    return result.rows[0];
}

async function create(building) {

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
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )

    RETURNING *
    `,
    [
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

async function update(id, building) {

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
        name=$1,
        address=$2,
        city=$3,
        country=$4,
        floors=$5,
        apartments_count=$6,
        status=$7,
        delivery_date=$8,
        description=$9,
        updated_at=NOW()
    WHERE id=$10
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
        id
    ]
    );

    return result.rows[0];

}

async function remove(id) {

    await pool.query(
        `
        DELETE
        FROM marega.buildings
        WHERE id=$1
        `,
        [id]
    );

}

module.exports = {

    getAll,
    getById,
    create,
    update,
    remove

};