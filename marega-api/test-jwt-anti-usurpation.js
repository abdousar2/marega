require("dotenv").config();

const jwt = require("jsonwebtoken");
const db = require("./src/config/database");

const API =
    process.env.TEST_API_URL ||
    "http://localhost:5000/api";

const USER_ID = 13;
const REAL_AGENCY_ID = 6;
const WRONG_AGENCY_ID = 1;


function makeToken({
    role,
    agencyId
}) {

    return jwt.sign(
        {
            id: USER_ID,

            email:
                "jwt-anti-usurpation-test@marega.local",

            role,

            agency_id:
                agencyId,

            agency_name:
                "AGENCE FALSIFIÉE"
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "10m"
        }
    );

}


async function get(
    path,
    token
) {

    const response =
        await fetch(
            `${API}${path}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


    let body = null;


    try {
        body = await response.json();
    }

    catch {}


    return {
        status:
            response.status,

        body
    };

}


function check(
    label,
    actual,
    expected
) {

    const ok =
        actual === expected;


    console.log(
        ok
            ? `✅ ${label} | HTTP ${actual}`
            : `❌ ${label} | HTTP ${actual} | attendu ${expected}`
    );


    return ok;

}


async function run() {

    let originalRole;


    console.log(
        "\n========================================"
    );

    console.log(
        "TEST ANTI-USURPATION JWT"
    );

    console.log(
        "========================================\n"
    );


    // =========================================================
    // 1. ÉTAT INITIAL
    // =========================================================

    const state =
        await db.query(
            `
                SELECT
                    u.id,
                    u.active AS user_active,
                    au.agency_id,
                    au.role,
                    au.active AS membership_active,
                    a.status AS agency_status

                FROM marega.users u

                INNER JOIN marega.agency_users au
                    ON au.user_id = u.id

                INNER JOIN marega.agencies a
                    ON a.id = au.agency_id

                WHERE
                    u.id = $1
                    AND au.agency_id = $2

                LIMIT 1
            `,
            [
                USER_ID,
                REAL_AGENCY_ID
            ]
        );


    if (
        state.rows.length === 0
    ) {

        throw new Error(
            `Utilisateur ${USER_ID} introuvable dans l'agence ${REAL_AGENCY_ID}.`
        );

    }


    const original =
        state.rows[0];


    originalRole =
        original.role;


    console.log(
        "ÉTAT INITIAL :"
    );

    console.table([
        original
    ]);


    if (
        !original.user_active ||
        !original.membership_active ||
        original.agency_status !== "active"
    ) {

        throw new Error(
            "L'utilisateur de test n'est pas actif."
        );

    }


    // =========================================================
    // 2. JWT LÉGITIME DE BASE
    // =========================================================

    console.log(
        "\n1) JWT LÉGITIME"
    );


    const legitimateToken =
        makeToken({
            role:
                originalRole,

            agencyId:
                REAL_AGENCY_ID
        });


    const legitimate =
        await get(
            "/users",
            legitimateToken
        );


    if (
        !check(
            "JWT légitime ADMIN",
            legitimate.status,
            200
        )
    ) {

        throw new Error(
            "Le token légitime n'est pas accepté."
        );

    }


    // =========================================================
    // 3. USURPATION D'AGENCE
    // =========================================================

    console.log(
        "\n2) USURPATION AGENCE 6 → AGENCE 1"
    );


    const foreignAgencyToken =
        makeToken({
            role:
                "ADMIN",

            agencyId:
                WRONG_AGENCY_ID
        });


    const foreignAgency =
        await get(
            "/buildings",
            foreignAgencyToken
        );


    console.log(
        "Réponse :",
        foreignAgency.status,
        foreignAgency.body
    );


    check(
        "JWT avec mauvaise agency_id",
        foreignAgency.status,
        401
    );


    // =========================================================
    // 4. ÉLÉVATION EN PLATFORM_ADMIN
    // =========================================================

    console.log(
        "\n3) ÉLÉVATION ADMIN → PLATFORM_ADMIN"
    );


    const platformAdminToken =
        makeToken({
            role:
                "PLATFORM_ADMIN",

            agencyId:
                REAL_AGENCY_ID
        });


    const platformAdmin =
        await get(
            "/users",
            platformAdminToken
        );


    console.log(
        "Réponse :",
        platformAdmin.status,
        platformAdmin.body
    );


    check(
        "JWT forgé PLATFORM_ADMIN",
        platformAdmin.status,
        401
    );


    // =========================================================
    // 5. ÉLÉVATION DE RÔLE
    // DB = AGENT
    // JWT = ADMIN
    // =========================================================

    console.log(
        "\n4) DB = AGENT / JWT = ADMIN"
    );


    await db.query(
        `
            UPDATE marega.agency_users

            SET role = 'AGENT'

            WHERE
                user_id = $1
                AND agency_id = $2
        `,
        [
            USER_ID,
            REAL_AGENCY_ID
        ]
    );


    const forgedAdminToken =
        makeToken({
            role:
                "ADMIN",

            agencyId:
                REAL_AGENCY_ID
        });


    const forgedAdmin =
        await get(
            "/users",
            forgedAdminToken
        );


    console.log(
        "Réponse :",
        forgedAdmin.status,
        forgedAdmin.body
    );


    check(
        "JWT ADMIN alors que DB = AGENT",
        forgedAdmin.status,
        403
    );


    // =========================================================
    // 6. RESTAURER LE RÔLE
    // =========================================================

    await db.query(
        `
            UPDATE marega.agency_users

            SET role = $1

            WHERE
                user_id = $2
                AND agency_id = $3
        `,
        [
            originalRole,
            USER_ID,
            REAL_AGENCY_ID
        ]
    );


    // =========================================================
    // 7. VÉRIFICATION APRÈS RESTAURATION
    // =========================================================

    console.log(
        "\n5) VÉRIFICATION APRÈS RESTAURATION"
    );


    const restoredToken =
        makeToken({
            role:
                originalRole,

            agencyId:
                REAL_AGENCY_ID
        });


    const restored =
        await get(
            "/users",
            restoredToken
        );


    check(
        "JWT légitime après restauration",
        restored.status,
        200
    );


    console.log(
        "\n========================================"
    );

    console.log(
        "✅ TEST ANTI-USURPATION TERMINÉ"
    );

    console.log(
        "========================================\n"
    );

}


run()

    .catch(async error => {

        console.error(
            "\n❌ TEST ÉCHOUÉ :"
        );

        console.error(
            error
        );


        // -----------------------------------------------------
        // RESTAURATION DE SÉCURITÉ
        // -----------------------------------------------------

        try {

            await db.query(
                `
                    UPDATE marega.agency_users

                    SET
                        active = TRUE,
                        role = 'ADMIN'

                    WHERE
                        user_id = $1
                        AND agency_id = $2
                `,
                [
                    USER_ID,
                    REAL_AGENCY_ID
                ]
            );


            console.log(
                "\n✅ Restauration de sécurité effectuée."
            );

        }

        catch (restoreError) {

            console.error(
                "\n❌ ÉCHEC DE RESTAURATION :",
                restoreError
            );

        }


        process.exitCode = 1;

    })


    .finally(() => {

        setTimeout(() => {
            process.exit();
        }, 700);

    });
