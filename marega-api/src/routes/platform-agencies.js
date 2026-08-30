const express = require("express");

const router = express.Router();

const pool = require("../config/database");


// =====================================================
// GET /api/platform/agencies
// Liste de toutes les agences
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
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
                created_at,
                updated_at

            FROM marega.agencies

            ORDER BY created_at DESC
        `);


        return res.json({

            agencies: result.rows

        });

    }

    catch (err) {

        console.error(
            "❌ PLATFORM AGENCIES GET ERROR:",
            err
        );


        return res.status(500).json({

            error:
                "Erreur lors du chargement des agences."

        });

    }

});

// =====================================================
// GET /api/platform/agencies/:id
// Détails d'une agence
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const agencyId = Number(req.params.id);

        if (!Number.isInteger(agencyId)) {

            return res.status(400).json({
                error: "Identifiant d'agence invalide."
            });

        }


        // =================================================
        // AGENCE
        // =================================================

        const agencyResult = await pool.query(
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
                created_at,
                updated_at

            FROM marega.agencies

            WHERE id = $1

            LIMIT 1
            `,
            [agencyId]
        );


        if (agencyResult.rows.length === 0) {

            return res.status(404).json({

                error:
                    "Agence introuvable."

            });

        }


        const agency =
            agencyResult.rows[0];


        // =================================================
        // UTILISATEURS DE L'AGENCE
        // =================================================

        const usersResult = await pool.query(
            `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                au.active,
                au.created_at

            FROM marega.agency_users au

            INNER JOIN marega.users u
                ON u.id = au.user_id

            WHERE au.agency_id = $1

            ORDER BY
                CASE
                    WHEN au.role = 'ADMIN' THEN 1
                    WHEN au.role = 'RESPONSABLE' THEN 2
                    WHEN au.role = 'COMPTABLE' THEN 3
                    ELSE 4
                END,
                u.last_name ASC,
                u.first_name ASC
            `,
            [agencyId]
        );


        return res.json({

            agency,

            users:
                usersResult.rows

        });

    }

    catch (err) {

        console.error(
            "❌ PLATFORM AGENCY DETAILS ERROR:",
            err
        );


        return res.status(500).json({

            error:
                "Erreur lors du chargement de l'agence."

        });

    }

});

// =====================================================
// POST /api/platform/agencies
// Création d'une agence + administrateur principal
// =====================================================

router.post("/", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            name,
            type,
            city,
            country,
            address,
            phone,
            email,

            admin_first_name,
            admin_last_name,
            admin_email,
            admin_password
        } = req.body;


        // -------------------------------------------------
        // VALIDATION AGENCE
        // -------------------------------------------------

        if (
            !name ||
            !type ||
            !city ||
            !country
        ) {

            return res.status(400).json({

                error:
                    "Les informations obligatoires de l'agence sont manquantes."

            });

        }


        // -------------------------------------------------
        // VALIDATION ADMINISTRATEUR
        // -------------------------------------------------

        if (
            !admin_first_name ||
            !admin_last_name ||
            !admin_email ||
            !admin_password
        ) {

            return res.status(400).json({

                error:
                    "Les informations de l'administrateur sont obligatoires."

            });

        }


        if (admin_password.length < 8) {

            return res.status(400).json({

                error:
                    "Le mot de passe doit contenir au moins 8 caractères."

            });

        }


        await client.query("BEGIN");


        // -------------------------------------------------
        // VÉRIFICATION NOM AGENCE
        // -------------------------------------------------

        const existingAgency =
            await client.query(
                `
                SELECT id
                FROM marega.agencies
                WHERE LOWER(name) = LOWER($1)
                LIMIT 1
                `,
                [name.trim()]
            );


        if (existingAgency.rows.length > 0) {

            throw new Error(
                "Une agence portant ce nom existe déjà."
            );

        }


        // -------------------------------------------------
        // 1. CRÉATION AGENCE
        // -------------------------------------------------

        const agencyResult = await client.query(
            `
            INSERT INTO marega.agencies (
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                status
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                'active'
            )

            RETURNING *
            `,
            [
                name.trim(),
                type.trim(),
                city.trim(),
                country.trim(),
                address?.trim() || null,
                phone?.trim() || null,
                email?.trim() || null
            ]
        );


        const agency =
            agencyResult.rows[0];


        // -------------------------------------------------
        // 2. VÉRIFICATION EMAIL ADMIN
        // -------------------------------------------------

        const existingUser =
            await client.query(
                `
                SELECT id
                FROM marega.users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [admin_email.trim()]
            );


        if (existingUser.rows.length > 0) {

            throw new Error(
                "Cette adresse email est déjà utilisée."
            );

        }


        // -------------------------------------------------
        // 3. HASH MOT DE PASSE
        // -------------------------------------------------

        const bcrypt =
            require("bcryptjs");

        const passwordHash =
            await bcrypt.hash(
                admin_password,
                12
            );


        // -------------------------------------------------
        // 4. CRÉATION UTILISATEUR
        // -------------------------------------------------

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
                    'ADMIN',
                    TRUE
                )

                RETURNING
                    id,
                    first_name,
                    last_name,
                    email,
                    role,
                    active
                `,
                [
                    admin_first_name.trim(),
                    admin_last_name.trim(),
                    admin_email.trim(),
                    passwordHash
                ]
            );


        const user =
            userResult.rows[0];


        // -------------------------------------------------
        // 5. RATTACHEMENT UTILISATEUR ↔ AGENCE
        // -------------------------------------------------

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
                'ADMIN',
                TRUE
            )
            `,
            [
                agency.id,
                user.id
            ]
        );


        // -------------------------------------------------
        // 6. VALIDATION TRANSACTION
        // -------------------------------------------------

        await client.query("COMMIT");


        return res.status(201).json({

            success: true,

            message:
                "Agence et administrateur créés avec succès.",

            agency,

            administrator: user

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM AGENCY CREATE ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible de créer l'agence."

        });

    }

    finally {

        client.release();

    }

});

// =====================================================
// POST /api/platform/agencies/:id/users
// Création d'un utilisateur dans une agence
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
                    "Tous les champs de l'utilisateur sont obligatoires."

            });

        }


        // =================================================
        // RÔLES AUTORISÉS
        // =================================================

        const allowedRoles = [
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


        // =================================================
        // MOT DE PASSE
        // =================================================

        if (password.length < 8) {

            return res.status(400).json({

                error:
                    "Le mot de passe doit contenir au moins 8 caractères."

            });

        }


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
                "Cette agence n'est pas active."
            );

        }


        // =================================================
        // 2. VÉRIFIER L'EMAIL
        // =================================================

        const existingUser =
            await client.query(
                `
                SELECT id

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
        // 3. HASH MOT DE PASSE
        // =================================================

        const bcrypt =
            require("bcryptjs");


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
                    created_at
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
        // 5. RATTACHER À L'AGENCE
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
        // 6. VALIDATION
        // =================================================

        await client.query("COMMIT");


        return res.status(201).json({

            success: true,

            message:
                "Utilisateur créé avec succès.",

            user,

            agency: {

                id:
                    agency.id,

                name:
                    agency.name

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
// PUT /api/platform/agencies/:id
// Modification d'une agence
// =====================================================

router.put("/:id", async (req, res) => {

    try {

        const agencyId =
            Number(req.params.id);


        // =================================================
        // VALIDATION ID
        // =================================================

        if (!Number.isInteger(agencyId)) {

            return res.status(400).json({

                error:
                    "Identifiant d'agence invalide."

            });

        }


        const {
            name,
            type,
            city,
            country,
            address,
            phone,
            email,
            status
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !name ||
            !type ||
            !city ||
            !country
        ) {

            return res.status(400).json({

                error:
                    "Le nom, le type, la ville et le pays sont obligatoires."

            });

        }


        // =================================================
        // VALIDATION STATUT
        // =================================================

        const allowedStatuses = [
            "active",
            "inactive"
        ];


        if (
            status &&
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                error:
                    "Statut d'agence invalide."

            });

        }


        // =================================================
        // VÉRIFIER QUE L'AGENCE EXISTE
        // =================================================

        const existingAgency =
            await pool.query(
                `
                SELECT
                    id,
                    name

                FROM marega.agencies

                WHERE id = $1

                LIMIT 1
                `,
                [agencyId]
            );


        if (existingAgency.rows.length === 0) {

            return res.status(404).json({

                error:
                    "Agence introuvable."

            });

        }


        // =================================================
        // VÉRIFIER LE NOM
        // =================================================

        const duplicateAgency =
            await pool.query(
                `
                SELECT
                    id

                FROM marega.agencies

                WHERE LOWER(name) = LOWER($1)

                AND id <> $2

                LIMIT 1
                `,
                [
                    name.trim(),
                    agencyId
                ]
            );


        if (duplicateAgency.rows.length > 0) {

            return res.status(409).json({

                error:
                    "Une autre agence portant ce nom existe déjà."

            });

        }


        // =================================================
        // MODIFICATION
        // =================================================

        const result =
            await pool.query(
                `
                UPDATE marega.agencies

                SET
                    name = $1,
                    type = $2,
                    city = $3,
                    country = $4,
                    address = $5,
                    phone = $6,
                    email = $7,
                    status = $8,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $9

                RETURNING
                    id,
                    name,
                    type,
                    city,
                    country,
                    address,
                    phone,
                    email,
                    status,
                    created_at,
                    updated_at
                `,
                [
                    name.trim(),
                    type.trim(),
                    city.trim(),
                    country.trim(),
                    address?.trim() || null,
                    phone?.trim() || null,
                    email?.trim() || null,
                    status || "active",
                    agencyId
                ]
            );


        // =================================================
        // RÉPONSE
        // =================================================

        return res.json({

            success: true,

            message:
                "Agence modifiée avec succès.",

            agency:
                result.rows[0]

        });

    }

    catch (err) {

        console.error(
            "❌ PLATFORM AGENCY UPDATE ERROR:",
            err
        );


        return res.status(500).json({

            error:
                "Erreur lors de la modification de l'agence."

        });

    }

});

// =====================================================
// PATCH /api/platform/agencies/:id/status
// Activation / désactivation d'une agence
// =====================================================

router.patch("/:id/status", async (req, res) => {

    const client = await pool.connect();

    try {

        const agencyId = Number(req.params.id);

        if (!Number.isInteger(agencyId)) {

            return res.status(400).json({

                error:
                    "Identifiant d'agence invalide."

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


        // =================================================
        // 2. MODIFIER LE STATUT DE L'AGENCE
        // =================================================

        const newStatus =
            active
                ? "active"
                : "inactive";


        const updateResult =
            await client.query(
                `
                UPDATE marega.agencies

                SET
                    status = $1

                WHERE id = $2

                RETURNING
                    id,
                    name,
                    type,
                    city,
                    country,
                    address,
                    phone,
                    email,
                    status
                `,
                [
                    newStatus,
                    agencyId
                ]
            );


        const agency =
            updateResult.rows[0];


        // =================================================
        // 3. SI L'AGENCE EST DÉSACTIVÉE
        //    ON DÉSACTIVE AUSSI SES UTILISATEURS
        // =================================================

        if (!active) {

            await client.query(
                `
                UPDATE marega.users

                SET
                    active = FALSE,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id IN (

                    SELECT
                        user_id

                    FROM marega.agency_users

                    WHERE agency_id = $1

                )
                `,
                [agencyId]
            );


            await client.query(
                `
                UPDATE marega.agency_users

                SET
                    active = FALSE

                WHERE agency_id = $1
                `,
                [agencyId]
            );

        }


        // =================================================
        // 4. SI L'AGENCE EST RÉACTIVÉE
        // =================================================

        if (active) {

            await client.query(
                `
                UPDATE marega.users

                SET
                    active = TRUE,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id IN (

                    SELECT
                        user_id

                    FROM marega.agency_users

                    WHERE agency_id = $1

                )
                `,
                [agencyId]
            );


            await client.query(
                `
                UPDATE marega.agency_users

                SET
                    active = TRUE

                WHERE agency_id = $1
                `,
                [agencyId]
            );

        }


        await client.query("COMMIT");


        return res.json({

            success: true,

            message:
                active
                    ? "Agence activée avec succès."
                    : "Agence désactivée avec succès.",

            agency

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM AGENCY STATUS ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible de modifier le statut de l'agence."

        });

    }

    finally {

        client.release();

    }

});


// =====================================================
// EXPORT
// =====================================================

module.exports = router;