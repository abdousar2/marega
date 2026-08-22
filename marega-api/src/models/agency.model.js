const db = require("../config/database");


class Agency {

    static async getAll() {

        const result = await db.query(`

            SELECT

                id,
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                status,
                created_at

            FROM marega.agencies

            WHERE status = 'active'

            ORDER BY name ASC

        `);

        return result.rows;

    }


    static async getById(id) {

        const result = await db.query(

            `
            SELECT

                id,
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                status,
                created_at

            FROM marega.agencies

            WHERE id = $1
            `,

            [id]

        );

        return result.rows[0];

    }

}


module.exports = Agency;