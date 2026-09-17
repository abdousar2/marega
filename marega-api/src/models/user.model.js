const db = require("../config/database");


class User {

    // =========================================================
    // TOUS LES UTILISATEURS D'UNE AGENCE
    // =========================================================

    static async getAll(agencyId) {

        const result = await db.query(
            `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,

                au.role,
                au.active,

                u.created_at,
                u.updated_at

            FROM marega.users u

            INNER JOIN marega.agency_users au
                ON au.user_id = u.id

            WHERE
                au.agency_id = $1

            ORDER BY
                u.last_name ASC,
                u.first_name ASC
            `,
            [agencyId]
        );

        return result.rows;
    }


    // =========================================================
    // UTILISATEUR PAR ID + AGENCE
    // =========================================================

    static async findById(id, agencyId) {

        const result = await db.query(
            `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.password_hash,

                au.role,
                au.active AS agency_active,

                u.active,
                u.created_at,
                u.updated_at

            FROM marega.users u

            INNER JOIN marega.agency_users au
                ON au.user_id = u.id

            WHERE
                u.id = $1
                AND au.agency_id = $2

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
    // UTILISATEUR PAR EMAIL
    // =========================================================

    static async findByEmail(email) {

        const result = await db.query(
            `
            SELECT *

            FROM marega.users

            WHERE
                LOWER(email) = LOWER($1)

            LIMIT 1
            `,
            [email]
        );

        return result.rows[0];
    }


    // =========================================================
    // UTILISATEUR PAR EMAIL + AGENCE
    // =========================================================

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
    // CRÉATION D'UN UTILISATEUR + RATTACHEMENT AGENCE
    // =========================================================

    static async create(data, agencyId) {

        const client =
            await db.connect();

        try {

            await client.query("BEGIN");


            // -------------------------------------------------
            // VÉRIFIER QUE L'AGENCE EXISTE ET EST ACTIVE
            // -------------------------------------------------

            const agencyResult =
                await client.query(
                    `
                    SELECT id, status

                    FROM marega.agencies

                    WHERE id = $1
                    `,
                    [agencyId]
                );


            if (agencyResult.rows.length === 0) {

                const error =
                    new Error(
                        "Agence introuvable."
                    );

                error.status = 404;

                throw error;
            }


            if (
                agencyResult.rows[0].status !==
                "active"
            ) {

                const error =
                    new Error(
                        "Cette agence n'est pas active."
                    );

                error.status = 403;

                throw error;
            }


            // -------------------------------------------------
            // EMAIL GLOBAL
            // -------------------------------------------------

            const existingUser =
                await client.query(
                    `
                    SELECT id

                    FROM marega.users

                    WHERE
                        LOWER(email) =
                        LOWER($1)

                    LIMIT 1
                    `,
                    [data.email]
                );


            if (existingUser.rows.length > 0) {

                const error =
                    new Error(
                        "Un utilisateur avec cet email existe déjà."
                    );

                error.status = 409;

                throw error;
            }


            // -------------------------------------------------
            // CRÉER LE COMPTE GLOBAL
            // -------------------------------------------------

            const userResult =
                await client.query(
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
                        TRUE
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
                        data.role
                    ]
                );


            const user =
                userResult.rows[0];


            // -------------------------------------------------
            // RATTACHER À L'AGENCE
            // -------------------------------------------------

            const membershipResult =
                await client.query(
                    `
                    INSERT INTO marega.agency_users
                    (
                        agency_id,
                        user_id,
                        role,
                        active
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        TRUE
                    )

                    RETURNING
                        agency_id,
                        role,
                        active
                    `,
                    [
                        agencyId,
                        user.id,
                        data.role
                    ]
                );


            await client.query("COMMIT");


            return {
                ...user,

                role:
                    membershipResult.rows[0].role,

                active:
                    membershipResult.rows[0].active

            };

        }

        catch (err) {

            await client.query("ROLLBACK");

            throw err;

        }

        finally {

            client.release();

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

        const client =
            await db.connect();

        try {

            await client.query("BEGIN");


            // -------------------------------------------------
            // VÉRIFIER L'APPARTENANCE À L'AGENCE
            // -------------------------------------------------

            const membership =
                await client.query(
                    `
                    SELECT
                        user_id,
                        role,
                        active

                    FROM marega.agency_users

                    WHERE
                        user_id = $1
                        AND agency_id = $2

                    FOR UPDATE
                    `,
                    [
                        id,
                        agencyId
                    ]
                );


            if (
                membership.rows.length === 0
            ) {

                await client.query("ROLLBACK");

                return null;
            }


            // -------------------------------------------------
            // MODIFIER L'IDENTITÉ GLOBALE
            // -------------------------------------------------

            const userResult =
                await client.query(
                    `
                    UPDATE marega.users

                    SET

                        first_name = $1,

                        last_name = $2,

                        email = $3,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE
                        id = $4

                    RETURNING
                        id,
                        first_name,
                        last_name,
                        email,
                        active,
                        created_at,
                        updated_at
                    `,
                    [
                        data.first_name,
                        data.last_name,
                        data.email,
                        id
                    ]
                );


            if (
                userResult.rows.length === 0
            ) {

                await client.query("ROLLBACK");

                return null;
            }


            // -------------------------------------------------
            // MODIFIER LE RÔLE / STATUT
            // DE CETTE AGENCE UNIQUEMENT
            // -------------------------------------------------

            const membershipResult =
                await client.query(
                    `
                    UPDATE marega.agency_users

                    SET

                        role = $1,

                        active = $2,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE
                        user_id = $3
                        AND agency_id = $4

                    RETURNING
                        role,
                        active
                    `,
                    [
                        data.role,
                        data.active !== false,
                        id,
                        agencyId
                    ]
                );


            await client.query("COMMIT");


            return {

                ...userResult.rows[0],

                role:
                    membershipResult.rows[0].role,

                active:
                    membershipResult.rows[0].active

            };

        }

        catch (err) {

            await client.query("ROLLBACK");

            throw err;

        }

        finally {

            client.release();

        }
    }


    // =========================================================
    // MODIFICATION DU MOT DE PASSE
    // =========================================================

    static async updatePassword(
        id,
        passwordHash,
        agencyId
    ) {

        const membership =
            await db.query(
                `
                SELECT user_id

                FROM marega.agency_users

                WHERE
                    user_id = $1
                    AND agency_id = $2

                LIMIT 1
                `,
                [
                    id,
                    agencyId
                ]
            );


        if (
            membership.rows.length === 0
        ) {

            return null;
        }


        const result =
            await db.query(
                `
                UPDATE marega.users

                SET
                    password_hash = $1,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE
                    id = $2

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
    // ACTIVATION / DÉSACTIVATION DANS UNE AGENCE
    // =========================================================

    static async updateActive(
        id,
        active,
        agencyId
    ) {

        const result =
            await db.query(
                `
                UPDATE marega.agency_users

                SET

                    active = $1,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE
                    user_id = $2
                    AND agency_id = $3

                RETURNING
                    user_id,
                    role,
                    active
                `,
                [
                    active,
                    id,
                    agencyId
                ]
            );


        if (
            result.rows.length === 0
        ) {

            return null;
        }


        const user =
            await db.query(
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


        if (
            user.rows.length === 0
        ) {

            return null;
        }


        return {

            ...user.rows[0],

            role:
                result.rows[0].role,

            active:
                result.rows[0].active

        };
    }


    // =========================================================
    // RETIRER UN UTILISATEUR D'UNE AGENCE
    // =========================================================

    static async delete(
        id,
        agencyId
    ) {

        const result =
            await db.query(
                `
                DELETE FROM marega.agency_users

                WHERE
                    user_id = $1
                    AND agency_id = $2

                RETURNING
                    user_id
                `,
                [
                    id,
                    agencyId
                ]
            );


        return result.rows.length > 0;
    }

}


module.exports = User;