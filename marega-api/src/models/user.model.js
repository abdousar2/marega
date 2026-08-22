const db = require("../config/database");

class User {

    // =========================================================
    // TOUS LES UTILISATEURS
    // =========================================================

    static async getAll() {

        const result = await db.query(`

            SELECT
                id,
                first_name,
                last_name,
                email,
                role,
                active,
                created_at,
                updated_at

            FROM marega.users

            ORDER BY last_name ASC,
                     first_name ASC

        `);

        return result.rows;

    }


    // =========================================================
    // UTILISATEUR PAR ID
    // =========================================================

    static async findById(id) {

        const result = await db.query(

            `

            SELECT
                id,
                first_name,
                last_name,
                email,
                role,
                active,
                created_at,
                updated_at

            FROM marega.users

            WHERE id = $1

            `,

            [id]

        );

        return result.rows[0];

    }


    // =========================================================
    // UTILISATEUR PAR EMAIL
    // =========================================================

    static async findByEmail(email) {

        const result = await db.query(

            `

            SELECT *

            FROM marega.users

            WHERE LOWER(email) = LOWER($1)

            `,

            [email]

        );

        return result.rows[0];

    }

    static async findByEmailAndAgency(email, agencyId) {

        const result = await db.query(

            `
            SELECT

                u.*,

                au.agency_id,
                au.role AS agency_role,
                au.active AS agency_active,

                a.name AS agency_name,
                a.type AS agency_type,
                a.city AS agency_city,
                a.country AS agency_country

            FROM marega.users u

            INNER JOIN marega.agency_users au
                ON au.user_id = u.id

            INNER JOIN marega.agencies a
                ON a.id = au.agency_id

            WHERE
                LOWER(u.email) = LOWER($1)

                AND au.agency_id = $2

                AND u.active = TRUE

                AND au.active = TRUE

                AND a.status = 'active'

            LIMIT 1
            `,

            [
                email,
                agencyId
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(data) {

        const result = await db.query(

            `

            INSERT INTO marega.users
            (
                first_name,
                last_name,
                email,
                password_hash,
                role,
                active
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )

            RETURNING
                id,
                first_name,
                last_name,
                email,
                role,
                active,
                created_at,
                updated_at

            `,

            [
                data.first_name,
                data.last_name,
                data.email,
                data.password_hash,
                data.role,
                data.active
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // MODIFICATION
    // =========================================================

    static async update(id, data) {

        const result = await db.query(

            `

            UPDATE marega.users

            SET

                first_name = $1,
                last_name = $2,
                email = $3,
                role = $4,
                active = $5,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $6

            RETURNING
                id,
                first_name,
                last_name,
                email,
                role,
                active,
                created_at,
                updated_at

            `,

            [
                data.first_name,
                data.last_name,
                data.email,
                data.role,
                data.active,
                id
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // MODIFICATION DU MOT DE PASSE
    // =========================================================

    static async updatePassword(
        id,
        passwordHash
    ) {

        const result = await db.query(

            `

            UPDATE marega.users

            SET

                password_hash = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2

            RETURNING
                id

            `,

            [
                passwordHash,
                id
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // ACTIVATION / DÉSACTIVATION
    // =========================================================

    static async updateActive(
        id,
        active
    ) {

        const result = await db.query(

            `

            UPDATE marega.users

            SET

                active = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2

            RETURNING
                id,
                first_name,
                last_name,
                email,
                role,
                active,
                updated_at

            `,

            [
                active,
                id
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // SUPPRESSION
    // =========================================================

    static async delete(id) {

        await db.query(

            `

            DELETE FROM marega.users

            WHERE id = $1

            `,

            [id]

        );

        return true;

    }

}

module.exports = User;