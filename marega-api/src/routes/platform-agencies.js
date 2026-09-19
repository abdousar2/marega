const express = require("express");

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
// à l'administration TECHTRADISPORT.
// =====================================================

router.use(
    authenticateToken,
    authorizeRoles("PLATFORM_ADMIN")
);


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
// GET /api/platform/agencies/:agencyId/leases
// Liste des baux d'une agence
// =====================================================

router.get(
    "/:agencyId/leases",
    async (req, res) => {

        try {

            const agencyId =
                Number(req.params.agencyId);

            if (!Number.isInteger(agencyId)) {

                return res.status(400).json({
                    error:
                        "Identifiant d'agence invalide."
                });

            }

            const result =
                await pool.query(
                    `
                    SELECT
                        l.id,
                        l.contract_number,
                        l.agency_id,
                        l.start_date,
                        l.end_date,
                        l.status,

                        t.first_name AS tenant_first_name,
                        t.last_name AS tenant_last_name,

                        a.number AS apartment_number,

                        b.name AS building_name

                    FROM marega.leases l

                    LEFT JOIN marega.tenants t
                        ON t.id = l.tenant_id

                    LEFT JOIN marega.apartments a
                        ON a.id = l.apartment_id

                    LEFT JOIN marega.buildings b
                        ON b.id = a.building_id

                    WHERE l.agency_id = $1

                    ORDER BY
                        l.id DESC
                    `,
                    [agencyId]
                );

            const leases =
                result.rows.map(
                    lease => ({

                        id:
                            lease.id,

                        contract_number:
                            lease.contract_number,

                        agency_id:
                            lease.agency_id,

                        start_date:
                            lease.start_date,

                        end_date:
                            lease.end_date,

                        status:
                            lease.status,

                        tenant_name:
                            [
                                lease.tenant_first_name,
                                lease.tenant_last_name
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .trim(),

                        apartment_number:
                            lease.apartment_number ||
                            "",

                        building_name:
                            lease.building_name ||
                            ""

                    })
                );

            return res.json({
                success: true,
                leases
            });

        }
        catch (err) {

            console.error(
                "❌ PLATFORM AGENCY LEASES ERROR:",
                err
            );

            return res.status(500).json({
                error:
                    "Erreur lors du chargement des baux."
            });

        }

    }
);


// =====================================================
// GET /api/platform/agencies/:id
// Détails d'une agence
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const agencyId =
            Number(req.params.id);

        if (!Number.isInteger(agencyId)) {

            return res.status(400).json({
                error:
                    "Identifiant d'agence invalide."
            });

        }


        // =================================================
        // AGENCE
        // =================================================

        const agencyResult =
            await pool.query(
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
        // IMPORTANT :
        // role + active viennent de agency_users
        // et non de users.
        // =================================================

        const usersResult =
            await pool.query(
                `
                SELECT
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,

                    au.role AS role,
                    au.active AS active,

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
//
// Cas 1 : l'email n'existe pas
// → création users + agency_users
//
// Cas 2 : l'email existe déjà
// → réutilisation de users
// → création uniquement agency_users
// =====================================================

router.post("/", async (req, res) => {

    const client =
        await pool.connect();

    let transactionStarted =
        false;

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


        // =================================================
        // VALIDATION AGENCE
        // =================================================

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


        // =================================================
        // VALIDATION ADMINISTRATEUR
        // =================================================

        if (
            !admin_first_name ||
            !admin_last_name ||
            !admin_email
        ) {

            return res.status(400).json({
                error:
                    "Le prénom, le nom et l'email de l'administrateur sont obligatoires."
            });

        }


        await client.query("BEGIN");

        transactionStarted =
            true;


        // =================================================
        // 1. VÉRIFIER LE NOM DE L'AGENCE
        // =================================================

        const existingAgency =
            await client.query(
                `
                SELECT
                    id

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


        // =================================================
        // 2. CRÉER L'AGENCE
        // =================================================

        const agencyResult =
            await client.query(
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


        // =================================================
        // 3. CHERCHER L'IDENTITÉ ADMINISTRATEUR
        // =================================================

        const existingUser =
            await client.query(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    active,
                    created_at

                FROM marega.users

                WHERE LOWER(email) = LOWER($1)

                LIMIT 1
                `,
                [admin_email.trim()]
            );


        let administrator;


        // =================================================
        // CAS A :
        // ADMINISTRATEUR EXISTANT
        // =================================================

        if (existingUser.rows.length > 0) {

            const existing =
                existingUser.rows[0];


            // -------------------------------------------------
            // Une identité globale inactive ne doit pas être
            // réactivée implicitement ici.
            //
            // users.active reste un état global.
            // -------------------------------------------------

            if (!existing.active) {

                throw new Error(
                    "Cette identité utilisateur est désactivée au niveau global."
                );

            }


            // -------------------------------------------------
            // Vérifier si elle appartient déjà à cette agence
            // -------------------------------------------------

            const existingMembership =
                await client.query(
                    `
                    SELECT
                        id

                    FROM marega.agency_users

                    WHERE agency_id = $1
                      AND user_id = $2

                    LIMIT 1
                    `,
                    [
                        agency.id,
                        existing.id
                    ]
                );


            if (existingMembership.rows.length > 0) {

                throw new Error(
                    "Cet utilisateur est déjà rattaché à cette agence."
                );

            }


            // -------------------------------------------------
            // Création UNIQUEMENT du membership
            // -------------------------------------------------

            await client.query(
                `
                INSERT INTO marega.agency_users (
                    agency_id,
                    user_id,
                    role,
                    active,
                    suspended_by_agency
                )

                VALUES (
                    $1,
                    $2,
                    'ADMIN',
                    TRUE,
                    FALSE
                )
                `,
                [
                    agency.id,
                    existing.id
                ]
            );


            administrator = {

                id:
                    existing.id,

                first_name:
                    existing.first_name,

                last_name:
                    existing.last_name,

                email:
                    existing.email,

                role:
                    "ADMIN",

                active:
                    true,

                created_at:
                    existing.created_at

            };

        }


        // =================================================
        // CAS B :
        // NOUVELLE IDENTITÉ
        // =================================================

        else {

            if (!admin_password) {

                throw new Error(
                    "Le mot de passe est obligatoire pour un nouvel administrateur."
                );

            }


            if (admin_password.length < 8) {

                throw new Error(
                    "Le mot de passe doit contenir au moins 8 caractères."
                );

            }


            const bcrypt =
                require("bcryptjs");


            const passwordHash =
                await bcrypt.hash(
                    admin_password,
                    12
                );


            // -------------------------------------------------
            // Création identité globale
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
                        active,
                        created_at
                    `,
                    [
                        admin_first_name.trim(),
                        admin_last_name.trim(),
                        admin_email.trim(),
                        passwordHash
                    ]
                );


            administrator =
                userResult.rows[0];


            // -------------------------------------------------
            // Création membership
            // -------------------------------------------------

            await client.query(
                `
                INSERT INTO marega.agency_users (
                    agency_id,
                    user_id,
                    role,
                    active,
                    suspended_by_agency
                )

                VALUES (
                    $1,
                    $2,
                    'ADMIN',
                    TRUE,
                    FALSE
                )
                `,
                [
                    agency.id,
                    administrator.id
                ]
            );

        }


        // =================================================
        // COMMIT
        // =================================================

        await client.query("COMMIT");

        transactionStarted =
            false;


        return res.status(201).json({

            success: true,

            message:
                "Agence et administrateur créés avec succès.",

            agency,

            administrator

        });

    }

    catch (err) {

        if (transactionStarted) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            }
            catch (rollbackError) {

                console.error(
                    "❌ PLATFORM AGENCY CREATE ROLLBACK ERROR:",
                    rollbackError
                );

            }

        }


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
//
// Création d'un utilisateur dans une agence.
//
// IMPORTANT :
// - users = identité globale
// - agency_users = appartenance à une agence
//
// Si l'email existe déjà globalement :
// → on ne recrée PAS users
// → on crée seulement agency_users
// =====================================================

router.post("/:id/users", async (req, res) => {

    const client =
        await pool.connect();

    let transactionStarted =
        false;

    try {

        const agencyId =
            Number(req.params.id);


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


        await client.query("BEGIN");

        transactionStarted =
            true;


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
        // 2. CHERCHER L'IDENTITÉ GLOBALE
        // =================================================

        const existingUser =
            await client.query(
                `
                SELECT
                    id,
                    first_name,
                    last_name,
                    email,
                    active,
                    created_at

                FROM marega.users

                WHERE LOWER(email) = LOWER($1)

                LIMIT 1
                `,
                [email.trim()]
            );


        let user;


        // =================================================
        // CAS A :
        // L'utilisateur existe déjà globalement
        // =================================================

        if (existingUser.rows.length > 0) {

            const existing =
                existingUser.rows[0];


            // -------------------------------------------------
            // Vérifier si l'utilisateur appartient déjà
            // à cette agence
            // -------------------------------------------------

            const existingMembership =
                await client.query(
                    `
                    SELECT
                        id,
                        role,
                        active

                    FROM marega.agency_users

                    WHERE agency_id = $1
                      AND user_id = $2

                    LIMIT 1
                    `,
                    [
                        agencyId,
                        existing.id
                    ]
                );


            if (existingMembership.rows.length > 0) {

                throw new Error(
                    "Cet utilisateur est déjà rattaché à cette agence."
                );

            }


            // -------------------------------------------------
            // NE PAS modifier :
            // users.first_name
            // users.last_name
            // users.email
            // users.password_hash
            // users.role
            //
            // On crée uniquement l'appartenance.
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
                    $3,
                    TRUE
                )
                `,
                [
                    agencyId,
                    existing.id,
                    role
                ]
            );


            user = {

                id:
                    existing.id,

                first_name:
                    existing.first_name,

                last_name:
                    existing.last_name,

                email:
                    existing.email,

                role:
                    role,

                active:
                    true,

                created_at:
                    existing.created_at

            };

        }


        // =================================================
        // CAS B :
        // L'utilisateur n'existe pas encore
        // =================================================

        else {

            if (!password) {

                throw new Error(
                    "Le mot de passe est obligatoire pour un nouvel utilisateur."
                );

            }


            if (password.length < 8) {

                throw new Error(
                    "Le mot de passe doit contenir au moins 8 caractères."
                );

            }


            const bcrypt =
                require("bcryptjs");


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            // -------------------------------------------------
            // Création identité globale
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


            user =
                userResult.rows[0];


            // -------------------------------------------------
            // Création appartenance agence
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

        }


        // =================================================
        // VALIDATION
        // =================================================

        await client.query("COMMIT");

        transactionStarted =
            false;


        return res.status(201).json({

            success: true,

            message:
                "Utilisateur rattaché à l'agence avec succès.",

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

        if (transactionStarted) {

            try {
                await client.query("ROLLBACK");
            }
            catch (rollbackError) {
                console.error(
                    "❌ PLATFORM AGENCY USER CREATE ROLLBACK ERROR:",
                    rollbackError
                );
            }

        }


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
                    name,
                    status

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
                    status ||
                        existingAgency.rows[0].status ||
                        "active",
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

    const client =
        await pool.connect();

    let transactionStarted =
        false;

    try {

        const agencyId =
            Number(req.params.id);


        if (!Number.isInteger(agencyId)) {

            return res.status(400).json({
                error:
                    "Identifiant d'agence invalide."
            });

        }


        const { active } =
            req.body;


        if (typeof active !== "boolean") {

            return res.status(400).json({
                error:
                    "Le statut active doit être true ou false."
            });

        }


        await client.query("BEGIN");

        transactionStarted =
            true;


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
                    status = $1,
                    updated_at = CURRENT_TIMESTAMP

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
        // 3. DÉSACTIVATION DE L'AGENCE
        //
        // On suspend UNIQUEMENT les memberships
        // qui étaient réellement actifs.
        //
        // On mémorise que la désactivation vient
        // de l'agence.
        //
        // Les utilisateurs déjà désactivés manuellement
        // restent désactivés et ne seront PAS réactivés
        // automatiquement plus tard.
        // =================================================

        if (!active) {

            await client.query(
                `
                UPDATE marega.agency_users

                SET
                    active = FALSE,
                    suspended_by_agency = TRUE,
                    updated_at = CURRENT_TIMESTAMP

                WHERE agency_id = $1
                  AND active = TRUE
                `,
                [agencyId]
            );

        }


        // =================================================
        // 4. RÉACTIVATION DE L'AGENCE
        //
        // On réactive UNIQUEMENT les memberships
        // qui avaient été suspendus automatiquement
        // par la désactivation de l'agence.
        //
        // Les utilisateurs déjà inactifs avant cette
        // désactivation restent inactifs.
        // =================================================

        if (active) {

            await client.query(
                `
                UPDATE marega.agency_users

                SET
                    active = TRUE,
                    suspended_by_agency = FALSE,
                    updated_at = CURRENT_TIMESTAMP

                WHERE agency_id = $1
                  AND suspended_by_agency = TRUE
                `,
                [agencyId]
            );

        }


        await client.query("COMMIT");

        transactionStarted =
            false;


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

        if (transactionStarted) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            }
            catch (rollbackError) {

                console.error(
                    "❌ PLATFORM AGENCY STATUS ROLLBACK ERROR:",
                    rollbackError
                );

            }

        }


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