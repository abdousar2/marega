const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const router = express.Router();

const pool = require("../config/database");



// =====================================================
// GET /api/platform/requests
// Liste de toutes les demandes
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                name,
                phone,
                email,
                company,
                buildings,
                tenants,
                message,
                status,
                created_at,
                updated_at

            FROM marega.contact_requests

            ORDER BY created_at DESC
        `);


        return res.json({

            requests: result.rows

        });

    }

    catch (err) {

        console.error(
            "❌ PLATFORM REQUESTS GET ERROR:",
            err
        );


        return res.status(500).json({

            error:
                "Erreur lors du chargement des demandes."

        });

    }

});


// =====================================================
// GET /api/platform/requests/:id
// Détails d'une demande
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const requestId =
            Number(req.params.id);


        if (!Number.isInteger(requestId)) {

            return res.status(400).json({

                error:
                    "Identifiant de demande invalide."

            });

        }


        const result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    phone,
                    email,
                    company,
                    buildings,
                    tenants,
                    message,
                    status,
                    created_at,
                    updated_at

                FROM marega.contact_requests

                WHERE id = $1

                LIMIT 1
                `,
                [requestId]
            );


        if (result.rows.length === 0) {

            return res.status(404).json({

                error:
                    "Demande introuvable."

            });

        }


        return res.json({

            request:
                result.rows[0]

        });

    }

    catch (err) {

        console.error(
            "❌ PLATFORM REQUEST DETAILS ERROR:",
            err
        );


        return res.status(500).json({

            error:
                "Erreur lors du chargement de la demande."

        });

    }

});

// =====================================================
// POST /api/platform/requests/:id/reject
// Refuser une demande de souscription
// =====================================================

router.post("/:id/reject", async (req, res) => {

    const client = await pool.connect();

    try {

        const requestId =
            Number(req.params.id);


        // =================================================
        // VALIDATION ID
        // =================================================

        if (!Number.isInteger(requestId)) {

            return res.status(400).json({

                error:
                    "Identifiant de demande invalide."

            });

        }


        // =================================================
        // TRANSACTION
        // =================================================

        await client.query("BEGIN");


        // =================================================
        // 1. RÉCUPÉRER LA DEMANDE
        // =================================================

        const requestResult =
            await client.query(
                `
                SELECT
                    id,
                    name,
                    company,
                    status

                FROM marega.contact_requests

                WHERE id = $1

                FOR UPDATE
                `,
                [requestId]
            );


        if (requestResult.rows.length === 0) {

            throw new Error(
                "Demande introuvable."
            );

        }


        const request =
            requestResult.rows[0];


        // =================================================
        // 2. VÉRIFIER LE STATUT
        // =================================================

        if (request.status === "rejected") {

            throw new Error(
                "Cette demande est déjà refusée."
            );

        }


        if (request.status === "approved") {

            throw new Error(
                "Cette demande a déjà été approuvée et ne peut plus être refusée."
            );

        }


        // =================================================
        // 3. REFUSER LA DEMANDE
        // =================================================

        const updateResult =
            await client.query(
                `
                UPDATE marega.contact_requests

                SET
                    status = 'rejected',
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $1

                RETURNING
                    id,
                    name,
                    phone,
                    email,
                    company,
                    buildings,
                    tenants,
                    message,
                    status,
                    created_at,
                    updated_at
                `,
                [requestId]
            );


        const updatedRequest =
            updateResult.rows[0];


        // =================================================
        // 4. COMMIT
        // =================================================

        await client.query("COMMIT");


        return res.json({

            success: true,

            message:
                "Demande refusée avec succès.",

            request:
                updatedRequest

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM REQUEST REJECT ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible de refuser la demande."

        });

    }

    finally {

        client.release();

    }

});


// =====================================================
// PATCH /api/platform/requests/:id/reject
// Refuser une demande
// =====================================================

router.patch("/:id/reject", async (req, res) => {

    try {

        const requestId =
            Number(req.params.id);


        if (!Number.isInteger(requestId)) {

            return res.status(400).json({

                error:
                    "Identifiant de demande invalide."

            });

        }


        const result =
            await pool.query(
                `
                UPDATE marega.contact_requests

                SET
                    status = 'rejected',
                    updated_at = NOW()

                WHERE id = $1
                  AND status = 'new'

                RETURNING
                    id,
                    name,
                    phone,
                    email,
                    company,
                    status,
                    updated_at
                `,
                [requestId]
            );


        if (result.rows.length === 0) {

            const existing =
                await pool.query(
                    `
                    SELECT
                        id,
                        status

                    FROM marega.contact_requests

                    WHERE id = $1
                    `,
                    [requestId]
                );


            if (existing.rows.length === 0) {

                return res.status(404).json({

                    error:
                        "Demande introuvable."

                });

            }


            return res.status(409).json({

                error:
                    "Cette demande a déjà été traitée."

            });

        }


        return res.json({

            success: true,

            message:
                "Demande refusée.",

            request:
                result.rows[0]

        });

    }

    catch (err) {

        console.error(
            "❌ PLATFORM REQUEST REJECT ERROR:",
            err
        );


        return res.status(500).json({

            error:
                "Impossible de refuser la demande."

        });

    }

});


// =====================================================
// PATCH /api/platform/requests/:id/approve
//
// APPROBATION D'UNE DEMANDE
//
// Création :
// 1. agence
// 2. administrateur principal
// 3. rattachement agence ↔ administrateur
// 4. demande → approved
// =====================================================

router.patch("/:id/approve", async (req, res) => {

    const client =
        await pool.connect();


    try {

        const requestId =
            Number(req.params.id);


        if (!Number.isInteger(requestId)) {

            return res.status(400).json({

                error:
                    "Identifiant de demande invalide."

            });

        }


        await client.query("BEGIN");


        // =================================================
        // 1. RÉCUPÉRER LA DEMANDE
        // =================================================

        const requestResult =
            await client.query(
                `
                SELECT
                    id,
                    name,
                    phone,
                    email,
                    company,
                    buildings,
                    tenants,
                    message,
                    status

                FROM marega.contact_requests

                WHERE id = $1

                FOR UPDATE
                `,
                [requestId]
            );


        if (requestResult.rows.length === 0) {

            throw new Error(
                "Demande introuvable."
            );

        }


        const request =
            requestResult.rows[0];


        // =================================================
        // 2. LA DEMANDE DOIT ÊTRE "new"
        // =================================================

        if (
            request.status !== "new"
        ) {

            throw new Error(
                "Cette demande a déjà été traitée."
            );

        }


        // =================================================
        // 3. VÉRIFIER SI L'AGENCE EXISTE
        // =================================================

        const existingAgency =
            await client.query(
                `
                SELECT
                    id,
                    name

                FROM marega.agencies

                WHERE LOWER(name) = LOWER($1)

                LIMIT 1
                `,
                [
                    request.company.trim()
                ]
            );


        if (existingAgency.rows.length > 0) {

            throw new Error(
                "Une agence portant ce nom existe déjà."
            );

        }


        // =================================================
        // 4. VÉRIFIER SI L'EMAIL EXISTE
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
                [
                    request.email.trim()
                ]
            );


        if (existingUser.rows.length > 0) {

            throw new Error(
                "L'adresse email du demandeur est déjà utilisée."
            );

        }


        // =================================================
        // 5. CRÉER L'AGENCE
        // =================================================

        const agencyResult =
            await client.query(
                `
                INSERT INTO marega.agencies
                (
                    name,
                    type,
                    city,
                    country,
                    address,
                    phone,
                    email,
                    status
                )

                VALUES
                (
                    $1,
                    'Agence immobilière',
                    'Dakar',
                    'Sénégal',
                    NULL,
                    $2,
                    $3,
                    'active'
                )

                RETURNING *
                `,
                [
                    request.company.trim(),
                    request.phone.trim(),
                    request.email.trim()
                ]
            );


        const agency =
            agencyResult.rows[0];


        // =================================================
        // 6. DÉCOMPOSER LE NOM
        // =================================================

        const nameParts =
            request.name
                .trim()
                .split(/\s+/);


        const firstName =
            nameParts.shift() ||
            "Administrateur";


        const lastName =
            nameParts.join(" ") ||
            "Agence";


        // =================================================
        // 7. GÉNÉRER UN MOT DE PASSE TEMPORAIRE
        // =================================================

        const temporaryPassword =
            crypto
                .randomBytes(6)
                .toString("base64")
                .replace(/[^a-zA-Z0-9]/g, "")
                .slice(0, 10);


        const passwordHash =
            await bcrypt.hash(
                temporaryPassword,
                12
            );


        // =================================================
        // 8. CRÉER L'ADMINISTRATEUR
        // =================================================

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
                    firstName,
                    lastName,
                    request.email.trim(),
                    passwordHash
                ]
            );


        const user =
            userResult.rows[0];


        // =================================================
        // 9. RATTACHER L'ADMIN À L'AGENCE
        // =================================================

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
                'ADMIN',
                TRUE
            )
            `,
            [
                agency.id,
                user.id
            ]
        );


        // =================================================
        // 10. PASSER LA DEMANDE À "approved"
        // =================================================

        await client.query(
            `
            UPDATE marega.contact_requests

            SET
                status = 'approved',
                updated_at = NOW()

            WHERE id = $1
            `,
            [requestId]
        );


        // =================================================
        // 11. VALIDATION TRANSACTION
        // =================================================

        await client.query("COMMIT");


        // =================================================
        // 12. RÉPONSE
        // =================================================

        return res.json({

            success: true,

            message:
                "Demande approuvée. Agence et administrateur créés avec succès.",

            agency,

            administrator: user,

            temporary_password:
                temporaryPassword

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM REQUEST APPROVE ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible d'approuver la demande."

        });

    }

    finally {

        client.release();

    }

});

// =====================================================
// POST /api/platform/requests/:id/approve
// Approuver une demande et créer automatiquement
// l'agence + son administrateur principal
// =====================================================

router.post("/:id/approve", async (req, res) => {

    const client = await pool.connect();

    try {

        const requestId =
            Number(req.params.id);


        // =================================================
        // VALIDATION ID
        // =================================================

        if (!Number.isInteger(requestId)) {

            return res.status(400).json({

                error:
                    "Identifiant de demande invalide."

            });

        }


        const {
            agency_name,
            agency_type,
            agency_city,
            agency_country,
            agency_address,
            agency_phone,
            agency_email,

            admin_first_name,
            admin_last_name,
            admin_email,
            admin_password

        } = req.body;


        // =================================================
        // VALIDATION AGENCE
        // =================================================

        if (
            !agency_name ||
            !agency_type ||
            !agency_city ||
            !agency_country
        ) {

            return res.status(400).json({

                error:
                    "Les informations obligatoires de l'agence sont manquantes."

            });

        }


        // =================================================
        // VALIDATION ADMIN
        // =================================================

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


        if (
            admin_password.length < 8
        ) {

            return res.status(400).json({

                error:
                    "Le mot de passe doit contenir au moins 8 caractères."

            });

        }


        await client.query("BEGIN");


        // =================================================
        // 1. RÉCUPÉRER LA DEMANDE
        // =================================================

        const requestResult =
            await client.query(
                `
                SELECT
                    id,
                    name,
                    phone,
                    email,
                    company,
                    buildings,
                    tenants,
                    message,
                    status,
                    created_at

                FROM marega.contact_requests

                WHERE id = $1

                FOR UPDATE
                `,
                [requestId]
            );


        if (
            requestResult.rows.length === 0
        ) {

            throw new Error(
                "Demande introuvable."
            );

        }


        const request =
            requestResult.rows[0];


        // =================================================
        // 2. VÉRIFIER LE STATUT
        // =================================================

        if (
            request.status !== "new"
        ) {

            throw new Error(
                "Cette demande a déjà été traitée."
            );

        }


        // =================================================
        // 3. VÉRIFIER LE NOM DE L'AGENCE
        // =================================================

        const existingAgency =
            await client.query(
                `
                SELECT id

                FROM marega.agencies

                WHERE LOWER(name) = LOWER($1)

                LIMIT 1
                `,
                [
                    agency_name.trim()
                ]
            );


        if (
            existingAgency.rows.length > 0
        ) {

            throw new Error(
                "Une agence portant ce nom existe déjà."
            );

        }


        // =================================================
        // 4. VÉRIFIER L'EMAIL ADMINISTRATEUR
        // =================================================

        const existingUser =
            await client.query(
                `
                SELECT id

                FROM marega.users

                WHERE LOWER(email) = LOWER($1)

                LIMIT 1
                `,
                [
                    admin_email.trim()
                ]
            );


        if (
            existingUser.rows.length > 0
        ) {

            throw new Error(
                "Cette adresse email administrateur est déjà utilisée."
            );

        }


        // =================================================
        // 5. CRÉER L'AGENCE
        // =================================================

        const agencyResult =
            await client.query(
                `
                INSERT INTO marega.agencies
                (
                    name,
                    type,
                    city,
                    country,
                    address,
                    phone,
                    email,
                    status
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
                    'active'
                )

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
                    agency_name.trim(),
                    agency_type.trim(),
                    agency_city.trim(),
                    agency_country.trim(),
                    agency_address?.trim() || null,
                    agency_phone?.trim() || null,
                    agency_email?.trim() || null
                ]
            );


        const agency =
            agencyResult.rows[0];


        // =================================================
        // 6. HASH MOT DE PASSE
        // =================================================

        const passwordHash =
            await bcrypt.hash(
                admin_password,
                12
            );


        // =================================================
        // 7. CRÉER ADMINISTRATEUR
        // =================================================

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


        const administrator =
            userResult.rows[0];


        // =================================================
        // 8. RATTACHER ADMIN À L'AGENCE
        // =================================================

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
                'ADMIN',
                TRUE
            )
            `,
            [
                agency.id,
                administrator.id
            ]
        );


        // =================================================
        // 9. MARQUER LA DEMANDE COMME APPROUVÉE
        // =================================================

        const updatedRequestResult =
            await client.query(
                `
                UPDATE marega.contact_requests

                SET
                    status = 'approved',
                    updated_at = NOW()

                WHERE id = $1

                RETURNING *
                `,
                [requestId]
            );


        const updatedRequest =
            updatedRequestResult.rows[0];


        // =================================================
        // 10. VALIDATION TRANSACTION
        // =================================================

        await client.query("COMMIT");


        return res.status(200).json({

            success: true,

            message:
                "Demande approuvée. Agence et administrateur créés avec succès.",

            request:
                updatedRequest,

            agency,

            administrator

        });

    }

    catch (err) {

        await client.query("ROLLBACK");


        console.error(
            "❌ PLATFORM REQUEST APPROVE ERROR:",
            err
        );


        return res.status(400).json({

            error:
                err.message ||
                "Impossible d'approuver la demande."

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