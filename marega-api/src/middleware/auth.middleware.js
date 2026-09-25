const jwt = require("jsonwebtoken");
const db = require("../config/database");


// =========================================================
// AUTHENTIFICATION JWT + VÉRIFICATION SESSION EN BASE
// =========================================================

async function authenticateToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                error:
                    "Authentification requise."
            });

        }


        const parts =
            authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({
                error:
                    "Format du token invalide."
            });

        }


        const token =
            parts[1];


        // -------------------------------------------------
        // 1. VÉRIFIER LA SIGNATURE ET L'EXPIRATION
        // -------------------------------------------------

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // -------------------------------------------------
        // 2. IDENTIFIANT OBLIGATOIRE
        // -------------------------------------------------

        const userId =
            Number(decoded.id);


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(401).json({
                error:
                    "Session invalide."
            });

        }


        // =================================================
        // 3. PLATFORM_ADMIN
        // =================================================

        if (
            String(decoded.role || "")
                .trim()
                .toUpperCase()
                === "PLATFORM_ADMIN"
        ) {

            const platformUser =
                await db.query(
                    `
                        SELECT
                            id,
                            email,
                            role,
                            active

                        FROM marega.users

                        WHERE
                            id = $1
                            AND active = TRUE
                            AND role = 'PLATFORM_ADMIN'

                        LIMIT 1
                    `,
                    [
                        userId
                    ]
                );


            if (
                platformUser.rows.length === 0
            ) {

                return res.status(401).json({
                    error:
                        "Session invalide ou compte désactivé."
                });

            }


            // On conserve les informations JWT utiles,
            // mais le rôle est confirmé par la base.

            req.user = {

                ...decoded,

                id:
                    platformUser.rows[0].id,

                email:
                    platformUser.rows[0].email,

                role:
                    platformUser.rows[0].role

            };


            return next();

        }


        // =================================================
        // 4. UTILISATEUR D'UNE AGENCE
        // =================================================

        const agencyId =
            Number(decoded.agency_id);


        if (
            !Number.isInteger(agencyId) ||
            agencyId <= 0
        ) {

            return res.status(401).json({
                error:
                    "Session d'agence invalide."
            });

        }


        // -------------------------------------------------
        // VÉRIFIER L'ÉTAT RÉEL EN BASE
        // -------------------------------------------------

        const membership =
            await db.query(
                `
                    SELECT

                        u.id,
                        u.email,
                        u.active AS user_active,

                        au.agency_id,
                        au.role,
                        au.active AS agency_active,

                        a.name AS agency_name,
                        a.status AS agency_status

                    FROM marega.users u

                    INNER JOIN marega.agency_users au
                        ON au.user_id = u.id

                    INNER JOIN marega.agencies a
                        ON a.id = au.agency_id

                    WHERE

                        u.id = $1

                        AND au.agency_id = $2

                        AND u.active = TRUE

                        AND au.active = TRUE

                        AND a.status = 'active'

                    LIMIT 1
                `,
                [
                    userId,
                    agencyId
                ]
            );


        if (
            membership.rows.length === 0
        ) {

            return res.status(401).json({
                error:
                    "Session invalide, utilisateur désactivé ou accès à cette agence révoqué."
            });

        }


        const current =
            membership.rows[0];


        // -------------------------------------------------
        // PROTECTION SUPPLÉMENTAIRE
        // -------------------------------------------------

        const currentRole =
            String(current.role || "")
                .trim()
                .toUpperCase();


        if (!currentRole) {

            return res.status(401).json({
                error:
                    "Rôle utilisateur invalide."
            });

        }


        // -------------------------------------------------
        // req.user = ÉTAT ACTUEL DE LA BASE
        // -------------------------------------------------

        req.user = {

            ...decoded,

            id:
                current.id,

            email:
                current.email,

            role:
                currentRole,

            agency_id:
                current.agency_id,

            agency_name:
                current.agency_name

        };


        next();

    }

    catch (err) {

        console.error(
            "Erreur authentification :",
            err.message
        );


        return res.status(401).json({
            error:
                "Session invalide ou expirée."
        });

    }

}


// =========================================================
// AUTORISATION PAR RÔLE
// =========================================================

function authorizeRoles(...roles) {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                error:
                    "Authentification requise."
            });

        }


        const userRole =
            String(req.user.role || "")
                .trim()
                .toUpperCase();


        const allowedRoles =
            roles.map(role =>
                String(role)
                    .trim()
                    .toUpperCase()
            );


        console.log(
            "----------------------------------------"
        );

        console.log(
            "AUTORISATION"
        );

        console.log(
            "User ID :",
            req.user.id
        );

        console.log(
            "Role reçu :",
            JSON.stringify(req.user.role)
        );

        console.log(
            "Role normalisé :",
            JSON.stringify(userRole)
        );

        console.log(
            "Roles attendus :",
            allowedRoles
        );

        console.log(
            "Autorisé :",
            allowedRoles.includes(userRole)
        );

        console.log(
            "----------------------------------------"
        );


        if (
            !allowedRoles.includes(userRole)
        ) {

            return res.status(403).json({

                success:
                    false,

                error:
                    "Vous n'avez pas les droits nécessaires.",

                role_received:
                    req.user.role,

                roles_required:
                    roles

            });

        }


        next();

    };

}


module.exports = {

    authenticateToken,

    authorizeRoles

};