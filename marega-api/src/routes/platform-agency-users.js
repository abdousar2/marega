const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

const pool =
    require("../config/database");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth.middleware");


// =====================================================
// SÉCURITÉ ESPACE PLATEFORME
// Toutes les routes de ce module sont réservées
// à PLATFORM_ADMIN.
// =====================================================

router.use(
    authenticateToken,
    authorizeRoles("PLATFORM_ADMIN")
);


// =====================================================
// PUT /api/platform/agencies/:id/users/:userId
// Modification d'un utilisateur dans une agence
// =====================================================

router.put(
    "/:id/users/:userId",

    async (req, res) => {

        const client =
            await pool.connect();

        try {

            const agencyId =
                Number(req.params.id);

            const userId =
                Number(req.params.userId);


            // =================================================
            // VALIDATION DES IDENTIFIANTS
            // =================================================

            if (
                !Number.isInteger(agencyId) ||
                !Number.isInteger(userId)
            ) {

                return res.status(400).json({

                    error:
                        "Identifiant invalide."

                });

            }


            // =================================================
            // DONNÉES
            // =================================================

            const {
                first_name,
                last_name,
                email,
                role
            } = req.body;


            // =================================================
            // VALIDATION
            // =================================================

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


            // =================================================
            // RÔLES AUTORISÉS
            // =================================================

            const allowedRoles = [

                "ADMIN",
                "RESPONSABLE",
                "COMPTABLE",
                "AGENT"

            ];


            if (
                !allowedRoles.includes(role)
            ) {

                return res.status(400).json({

                    error:
                        "Rôle utilisateur invalide."

                });

            }


            // =================================================
            // TRANSACTION
            // =================================================

            await client.query("BEGIN");


            // =================================================
            // VÉRIFIER LE RATTACHEMENT
            // =================================================

            const relationResult =
                await client.query(

                    `
                    SELECT
                        au.user_id,
                        au.agency_id,
                        au.role,
                        au.active

                    FROM marega.agency_users au

                    WHERE
                        au.agency_id = $1
                        AND au.user_id = $2

                    LIMIT 1
                    `,

                    [
                        agencyId,
                        userId
                    ]

                );


            if (
                relationResult.rows.length === 0
            ) {

                throw new Error(
                    "Cet utilisateur n'est pas rattaché à cette agence."
                );

            }


            // =================================================
            // VÉRIFIER L'EMAIL
            // L'email reste globalement unique
            // =================================================

            const existingEmail =
                await client.query(

                    `
                    SELECT
                        id

                    FROM marega.users

                    WHERE
                        LOWER(email) = LOWER($1)

                        AND id <> $2

                    LIMIT 1
                    `,

                    [
                        email.trim(),
                        userId
                    ]

                );


            if (
                existingEmail.rows.length > 0
            ) {

                throw new Error(
                    "Cette adresse email est déjà utilisée."
                );

            }


            // =================================================
            // MODIFIER L'IDENTITÉ GLOBALE
            //
            // IMPORTANT :
            // NE PAS modifier users.role ici.
            // Le rôle appartient à agency_users.
            // =================================================

            const userResult =
                await client.query(

                    `
                    UPDATE marega.users

                    SET
                        first_name =
                            $1,

                        last_name =
                            $2,

                        email =
                            $3,

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
                        first_name.trim(),
                        last_name.trim(),
                        email.trim(),
                        userId
                    ]

                );


            if (
                userResult.rows.length === 0
            ) {

                throw new Error(
                    "Utilisateur introuvable."
                );

            }


            // =================================================
            // MODIFIER LE RÔLE DE CETTE AGENCE UNIQUEMENT
            // =================================================

            const membershipResult =
                await client.query(

                    `
                    UPDATE marega.agency_users

                    SET
                        role =
                            $1,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE
                        agency_id = $2
                        AND user_id = $3

                    RETURNING
                        role,
                        active
                    `,

                    [
                        role,
                        agencyId,
                        userId
                    ]

                );


            if (
                membershipResult.rows.length === 0
            ) {

                throw new Error(
                    "Le rattachement de l'utilisateur est introuvable."
                );

            }


            // =================================================
            // COMMIT
            // =================================================

            await client.query("COMMIT");


            // =================================================
            // RÉPONSE
            // =================================================

            const user = {

                ...userResult.rows[0],

                role:
                    membershipResult.rows[0].role,

                active:
                    membershipResult.rows[0].active

            };


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

    }

);


// =====================================================
// PATCH /api/platform/agencies/:id/users/:userId/status
// Activation / désactivation d'un utilisateur
// =====================================================

router.patch(
    "/:id/users/:userId/status",

    async (req, res) => {

        const client =
            await pool.connect();

        try {

            const agencyId =
                Number(req.params.id);

            const userId =
                Number(req.params.userId);


            // =================================================
            // VALIDATION DES IDENTIFIANTS
            // =================================================

            if (
                !Number.isInteger(agencyId) ||
                !Number.isInteger(userId)
            ) {

                return res.status(400).json({

                    error:
                        "Identifiant invalide."

                });

            }


            // =================================================
            // STATUT
            // =================================================

            const {
                active
            } = req.body;


            if (
                typeof active !== "boolean"
            ) {

                return res.status(400).json({

                    error:
                        "Le statut active doit être true ou false."

                });

            }


            // =================================================
            // TRANSACTION
            // =================================================

            await client.query("BEGIN");


            // =================================================
            // VÉRIFIER LE RATTACHEMENT
            // =================================================

            const relationResult =
                await client.query(

                    `
                    SELECT
                        user_id,
                        agency_id,
                        role,
                        active

                    FROM marega.agency_users

                    WHERE
                        agency_id = $1
                        AND user_id = $2

                    LIMIT 1
                    `,

                    [
                        agencyId,
                        userId
                    ]

                );


            if (
                relationResult.rows.length === 0
            ) {

                throw new Error(
                    "Cet utilisateur n'est pas rattaché à cette agence."
                );

            }


            // =================================================
            // MODIFIER UNIQUEMENT LE STATUT
            // DE L'APPARTENANCE À CETTE AGENCE
            //
            // IMPORTANT :
            // NE PAS modifier users.active.
            // =================================================

            const membershipResult =
                await client.query(

                    `
                    UPDATE marega.agency_users

                    SET
                        active =
                            $1,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE
                        agency_id = $2
                        AND user_id = $3

                    RETURNING
                        user_id,
                        role,
                        active
                    `,

                    [
                        active,
                        agencyId,
                        userId
                    ]

                );


            if (
                membershipResult.rows.length === 0
            ) {

                throw new Error(
                    "Le rattachement de l'utilisateur est introuvable."
                );

            }


            // =================================================
            // RÉCUPÉRER L'IDENTITÉ GLOBALE
            // SANS modifier users.active
            // =================================================

            const identityResult =
                await client.query(

                    `
                    SELECT

                        id,
                        first_name,
                        last_name,
                        email,
                        created_at,
                        updated_at

                    FROM marega.users

                    WHERE
                        id = $1

                    LIMIT 1
                    `,

                    [
                        userId
                    ]

                );


            if (
                identityResult.rows.length === 0
            ) {

                throw new Error(
                    "Utilisateur introuvable."
                );

            }


            // =================================================
            // COMMIT
            // =================================================

            await client.query("COMMIT");


            // =================================================
            // RÉPONSE
            // =================================================

            const user = {

                ...identityResult.rows[0],

                role:
                    membershipResult.rows[0].role,

                active:
                    membershipResult.rows[0].active

            };


            return res.json({

                success: true,

                message:
                    active
                        ? "Utilisateur activé avec succès."
                        : "Utilisateur désactivé avec succès.",

                user

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

    }

);


// =====================================================
// PATCH /api/platform/agencies/:id/users/:userId/password
// Réinitialisation du mot de passe
// =====================================================

router.patch(
    "/:id/users/:userId/password",

    async (req, res) => {

        const client =
            await pool.connect();

        try {

            const agencyId =
                Number(req.params.id);

            const userId =
                Number(req.params.userId);


            // =================================================
            // VALIDATION DES IDENTIFIANTS
            // =================================================

            if (
                !Number.isInteger(agencyId) ||
                !Number.isInteger(userId)
            ) {

                return res.status(400).json({

                    error:
                        "Identifiant invalide."

                });

            }


            // =================================================
            // MOT DE PASSE
            // =================================================

            const {
                password
            } = req.body;


            if (!password) {

                return res.status(400).json({

                    error:
                        "Le nouveau mot de passe est obligatoire."

                });

            }


            if (
                password.length < 8
            ) {

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
            // VÉRIFIER LE RATTACHEMENT
            // =================================================

            const relationResult =
                await client.query(

                    `
                    SELECT
                        au.user_id,
                        au.agency_id,
                        au.role,
                        au.active

                    FROM marega.agency_users au

                    WHERE
                        au.agency_id = $1
                        AND au.user_id = $2

                    LIMIT 1
                    `,

                    [
                        agencyId,
                        userId
                    ]

                );


            if (
                relationResult.rows.length === 0
            ) {

                throw new Error(
                    "Cet utilisateur n'est pas rattaché à cette agence."
                );

            }


            // =================================================
            // HASH
            // =================================================

            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            // =================================================
            // MODIFIER LE MOT DE PASSE GLOBAL
            //
            // C'est volontaire :
            // le mot de passe appartient au compte users,
            // pas à agency_users.
            // =================================================

            const userResult =
                await client.query(

                    `
                    UPDATE marega.users

                    SET
                        password_hash =
                            $1,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE
                        id = $2

                    RETURNING
                        id,
                        first_name,
                        last_name,
                        email,
                        created_at,
                        updated_at
                    `,

                    [
                        passwordHash,
                        userId
                    ]

                );


            if (
                userResult.rows.length === 0
            ) {

                throw new Error(
                    "Utilisateur introuvable."
                );

            }


            // =================================================
            // COMMIT
            // =================================================

            await client.query("COMMIT");


            // =================================================
            // RÉPONSE
            // =================================================

            const user = {

                ...userResult.rows[0],

                role:
                    relationResult.rows[0].role,

                active:
                    relationResult.rows[0].active

            };


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

    }

);


module.exports = router;