const pool = require("../config/database");

async function getAll() {

    const result = await pool.query(`
        SELECT *
        FROM marega.tenants
        ORDER BY id DESC
    `);

    return result.rows;

}

async function getById(id) {

    const result = await pool.query(

        `
        SELECT *
        FROM marega.tenants
        WHERE id = $1
        `,

        [id]

    );

    return result.rows[0];

}

async function create(tenant) {

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

    const result = await pool.query(

        `
        INSERT INTO marega.tenants
        (
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
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )

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
            notes

        ]

    );

    return result.rows[0];

}

async function update(id, tenant) {

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

    const result = await pool.query(

        `
        UPDATE marega.tenants

        SET

            apartment_id=$1,
            first_name=$2,
            last_name=$3,
            phone=$4,
            email=$5,
            id_type=$6,
            id_number=$7,
            profession=$8,
            employer=$9,
            emergency_contact=$10,
            emergency_phone=$11,
            entry_date=$12,
            exit_date=$13,
            deposit=$14,
            status=$15,
            notes=$16,
            updated_at=NOW()

        WHERE id=$17

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
            id

        ]

    );

    return result.rows[0];

}

async function remove(id) {

    await pool.query(

        `
        DELETE FROM marega.tenants
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