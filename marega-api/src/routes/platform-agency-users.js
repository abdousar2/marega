const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

const pool = require("../config/database");


// =====================================================
// POST /api/platform/agencies/:id/users
// Création d'un utilisateur et rattachement à une agence
// =====================================================

router.post("/:id/users", async (req, res) => {

    const client = await pool.connect();

    try {

        const agencyId = Number(req.params.id);

        if (!Number.isInteger(agencyId)) {

            return res.status(400).json({

                error:
                    "Identifiant d'agence invalide."

            });

        }


        const {
            first_name,
            last_name,
            email,
            password,
            role
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !first_name ||
            !last_name ||
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({

                error:
                    "Tous les champs obligatoires doivent être renseignés."

            });

        }


        const allowedRoles = [
            "ADMIN",
            "RESPONSABLE",
            "COMPTABLE",
            "AGENT"
        ];


        if (!allowedRoles.includes(role)) {

            return res.status(400).json({

                error:
                    "Rôle utilisateur invalide."

            });

        }


        if (password.length < 8) {

            return res.status(400).json({

                error:
                    "Le mot de passe doit contenir au moins 8 caractères."

            });

        }


        // =================================================
        // TRANSACTION
        // =================================================

        await client.query("BEGIN");


        // =================================================
        // 1. VÉRIFIER L'AGENCE
        // =================================================

        const agencyResult =
            await client.query(
                `
                SELECT
                    id,
                    name,
                    status

                FROM marega.agencies

                WHERE id = $1

                LIMIT 1
                `,
                [agencyId]
            );


        if (agencyResult.rows.length === 0) {

            throw new Error(
                "Agence introuvable."
            );

        }


        const agency =
            agencyResult.rows[0];


        if (agency.status !== "active") {

            throw new Error(
                "Cette agence est inactive."
            );

        }


        // =================================================
        // 2. VÉRIFIER L'EMAIL
        // =================================================

        const existingUser =
            await client.query(
                `
                SELECT
                    id,
                    email

                FROM marega.users

                WHERE LOWER(email) = LOWER($1)

                LIMIT 1
                `,
                [email.trim()]
            );


        if (existingUser.rows.length > 0) {

            throw new Error(
                "Cette adresse email est déjà utilisée."
            );

        }


        // =================================================
        // 3. HASH DU MOT DE PASSE
        // =================================================

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        // =================================================
        // 4. CRÉER L'UTILISATEUR
        // =================================================

        const userResult =
            await client.query(
                `
                INSERT INTO marega.users (
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    role,
                    active
                )

                VALUES (
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
                    first_name.trim(),
                    last_name.trim(),
                    email.trim(),
                    passwordHash,
                    role
                ]
            );


        const user =
            userResult.rows[0];


        // =================================================
        // 5. RATTACHER L'UTILISATEUR À L'AGENCE
        // =================================================

        await client.query(
            `
            INSERT INTO marega.agency_users (
                agency_id,
                user_id,
                role,
                active
            )

            VALUES (
                $1,
                $2,
                $3,
                TRUE
            )
            `,
            [
                agencyId,
                user.id,
                role
            ]
        );


        // =================================================
        // 6. COMMIT
        // =================================================

        await client.query("COMMIT");


        return res.status(201).json({

            success: true,

            message:
                "Utilisateur créé et rattaché à l'agence avec succès.",

            user,

            agency: {

                id: agency.id,

                name: agency.name

            }

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM AGENCY USER CREATE ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible de créer l'utilisateur."

        });

    }

    finally {

        client.release();

    }

});

// =====================================================
// PUT /api/platform/agencies/:id/users/:userId
// Modification d'un utilisateur
// =====================================================

router.put("/:id/users/:userId", async (req, res) => {

    const client = await pool.connect();

    try {

        const agencyId = Number(req.params.id);
        const userId = Number(req.params.userId);

        if (
            !Number.isInteger(agencyId) ||
            !Number.isInteger(userId)
        ) {

            return res.status(400).json({
                error: "Identifiant invalide."
            });

        }


        const {
            first_name,
            last_name,
            email,
            role
        } = req.body;


        if (
            !first_name ||
            !last_name ||
            !email ||
            !role
        ) {

            return res.status(400).json({
                error:
                    "Le prénom, le nom, l'email et le rôle sont obligatoires."
            });

        }


        const allowedRoles = [
            "ADMIN",
            "RESPONSABLE",
            "COMPTABLE",
            "AGENT"
        ];


        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                error: "Rôle utilisateur invalide."
            });

        }


        await client.query("BEGIN");


        // Vérifier que l'utilisateur appartient bien à l'agence

        const relationResult =
            await client.query(
                `
                SELECT
                    au.user_id,
                    au.agency_id

                FROM marega.agency_users au

                WHERE au.agency_id = $1
                AND au.user_id = $2

                LIMIT 1
                `,
                [
                    agencyId,
                    userId
                ]
            );


        if (relationResult.rows.length === 0) {

            throw new Error(
                "Cet utilisateur n'est pas rattaché à cette agence."
            );

        }


        // Vérifier que l'email n'est pas déjà utilisé
        // par un autre utilisateur

        const existingEmail =
            await client.query(
                `
                SELECT id

                FROM marega.users

                WHERE LOWER(email) = LOWER($1)
                AND id <> $2

                LIMIT 1
                `,
                [
                    email.trim(),
                    userId
                ]
            );


        if (existingEmail.rows.length > 0) {

            throw new Error(
                "Cette adresse email est déjà utilisée."
            );

        }


        // Modifier l'utilisateur

        const userResult =
            await client.query(
                `
                UPDATE marega.users

                SET
                    first_name = $1,
                    last_name = $2,
                    email = $3,
                    role = $4,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $5

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
                    first_name.trim(),
                    last_name.trim(),
                    email.trim(),
                    role,
                    userId
                ]
            );


        const user =
            userResult.rows[0];


        // Synchroniser le rôle dans agency_users

        await client.query(
            `
            UPDATE marega.agency_users

            SET
                role = $1

            WHERE agency_id = $2
            AND user_id = $3
            `,
            [
                role,
                agencyId,
                userId
            ]
        );


        await client.query("COMMIT");


        return res.json({

            success: true,

            message:
                "Utilisateur modifié avec succès.",

            user

        });

    }

    catch (err) {

        await client.query("ROLLBACK");

        console.error(
            "❌ PLATFORM AGENCY USER UPDATE ERROR:",
            err
        );

        return res.status(400).json({

            error:
                err.message ||
                "Impossible de modifier l'utilisateur."

        });

    }

    finally {

        client.release();

    }

});

// =====================================================
// PATCH /api/platform/agencies/:id/users/:userId/status
// Activation / désactivation d'un utilisateur
// =====================================================

router.patch("/:id/users/:userId/status", async (req, res) => {

    const client = await pool.connect();

    try {

        const agencyId = Number(req.params.id);
        const userId = Number(req.params.userId);

        if (
            !Number.isInteger(agencyId) ||
            !Number.isInteger(userId)
        ) {

            return res.status(400).json({
                error: "Identifiant invalide."
            });

        }


        const { active } = req.body;


        if (typeof active !== "boolean") {

            return res.status(400).json({
                error:
                    "Le statut active doit être true ou false."
            });

        }


        await client.query("BEGIN");


        // Vérifier le rattachement

        const relationResult =
            await client.query(
                `
                SELECT
                    user_id

                FROM marega.agency_users

                WHERE agency_id = $1
                AND user_id = $2

                LIMIT 1
                `,
                [
                    agencyId,
                    userId
                ]
            );


        if (relationResult.rows.length === 0) {

            throw new Error(
                "Cet utilisateur n'est pas rattaché à cette agence."
            );

        }


        // Mettre à jour users

        const userResult =
            await client.query(
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
                    created_at,
                    updated_at
                `,
                [
                    active,
                    userId
                ]
            );


        // Synchroniser agency_users

        await client.query(
            `
            UPDATE marega.agency_users

            SET
                active = $1

            WHERE agency_id = $2
            AND user_id = $3
            `,
            [
                active,
                agencyId,
                userId
            ]
        );


        await client.query("COMMIT");


        return res.json({

            success: true,

            message:
                active
                    ? "Utilisateur activé avec succès."
                    : "Utilisateur désactivé avec succès.",

            user:
                userResult.rows[0]

        });

    }

    catch (err) {

        await client.query("ROLLBACK");

        console.error(
            "❌ PLATFORM AGENCY USER STATUS ERROR:",
            err
        );

        return res.status(400).json({

            error:
                err.message ||
                "Impossible de modifier le statut."

        });

    }

    finally {

        client.release();

    }

});

// =====================================================
// PATCH /api/platform/agencies/:id/users/:userId/password
// Réinitialisation du mot de passe d'un utilisateur
// =====================================================

router.patch("/:id/users/:userId/password", async (req, res) => {

    const client = await pool.connect();

    try {

        const agencyId = Number(req.params.id);
        const userId = Number(req.params.userId);

        if (
            !Number.isInteger(agencyId) ||
            !Number.isInteger(userId)
        ) {

            return res.status(400).json({

                error:
                    "Identifiant invalide."

            });

        }


        const {
            password
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (!password) {

            return res.status(400).json({

                error:
                    "Le nouveau mot de passe est obligatoire."

            });

        }


        if (password.length < 8) {

            return res.status(400).json({

                error:
                    "Le mot de passe doit contenir au moins 8 caractères."

            });

        }


        // =================================================
        // TRANSACTION
        // =================================================

        await client.query("BEGIN");


        // =================================================
        // 1. VÉRIFIER LE RATTACHEMENT
        // =================================================

        const relationResult =
            await client.query(
                `
                SELECT
                    au.user_id,
                    au.agency_id,
                    au.active

                FROM marega.agency_users au

                WHERE au.agency_id = $1
                AND au.user_id = $2

                LIMIT 1
                `,
                [
                    agencyId,
                    userId
                ]
            );


        if (relationResult.rows.length === 0) {

            throw new Error(
                "Cet utilisateur n'est pas rattaché à cette agence."
            );

        }


        // =================================================
        // 2. HASH DU NOUVEAU MOT DE PASSE
        // =================================================

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        // =================================================
        // 3. MISE À JOUR
        // =================================================

        const userResult =
            await client.query(
                `
                UPDATE marega.users

                SET
                    password_hash = $1,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $2

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
                    passwordHash,
                    userId
                ]
            );


        if (userResult.rows.length === 0) {

            throw new Error(
                "Utilisateur introuvable."
            );

        }


        const user =
            userResult.rows[0];


        // =================================================
        // 4. COMMIT
        // =================================================

        await client.query("COMMIT");


        return res.json({

            success: true,

            message:
                "Mot de passe réinitialisé avec succès.",

            user

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM AGENCY USER PASSWORD ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible de réinitialiser le mot de passe."

        });

    }

    finally {

        client.release();

    }

});


module.exports = router;