require("dotenv").config();

const jwt = require("jsonwebtoken");
const db = require("./src/config/database");

const API =
    process.env.TEST_API_URL ||
    "http://localhost:5000/api";

const AGENCY_ID = 6;
const USER_ID = 13;

function makeToken(role, agencyId = AGENCY_ID) {

    return jwt.sign(
        {
            id: USER_ID,
            email: "jwt-revocation-test@marega.local",
            role,
            agency_id: agencyId,
            agency_name: "JWT REVOCATION TEST"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10m"
        }
    );

}

async function get(path, token) {

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
        status: response.status,
        body
    };

}


function check(label, actual, expected) {

    const ok = actual === expected;

    console.log(
        ok
            ? `✅ ${label} | HTTP ${actual}`
            : `❌ ${label} | HTTP ${actual} | attendu ${expected}`
    );

    return ok;

}


async function run() {

    let originalRole;
    let originalMembershipActive;
    let originalUserActive;


    console.log(
        "\n========================================"
    );

    console.log(
        "TEST RÉVOCATION / ACTUALISATION JWT"
    );

    console.log(
        "========================================\n"
    );


    // =========================================================
    // 1. ÉTAT ORIGINAL
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
                AGENCY_ID
            ]
        );


    if (state.rows.length === 0) {

        throw new Error(
            `Utilisateur ${USER_ID} introuvable dans l'agence ${AGENCY_ID}.`
        );

    }


    const original =
        state.rows[0];


    originalRole =
        original.role;

    originalMembershipActive =
        original.membership_active;

    originalUserActive =
        original.user_active;


    console.log(
        "ÉTAT ORIGINAL :"
    );

    console.table([
        original
    ]);


    if (
        !originalMembershipActive ||
        !originalUserActive ||
        original.agency_status !== "active"
    ) {

        throw new Error(
            "L'utilisateur de test n'est pas dans un état actif permettant le test."
        );

    }


    // =========================================================
    // 2. JWT ADMIN INITIAL
    // =========================================================

    const adminToken =
        makeToken(
            originalRole
        );


    console.log(
        "\n1) JWT INITIAL"
    );


    const baseline =
        await get(
            "/users",
            adminToken
        );


    if (
        !check(
            "Ancien JWT avant modification",
            baseline.status,
            200
        )
    ) {

        throw new Error(
            "Le JWT initial n'a pas permis l'accès ADMIN attendu."
        );

    }


    // =========================================================
    // 3. DÉSACTIVER LE MEMBERSHIP
    // =========================================================

    console.log(
        "\n2) DÉSACTIVATION agency_users.active = FALSE"
    );


    await db.query(
        `
            UPDATE marega.agency_users

            SET active = FALSE

            WHERE
                user_id = $1
                AND agency_id = $2
        `,
        [
            USER_ID,
            AGENCY_ID
        ]
    );


    const afterMembershipDisable =
        await get(
            "/buildings",
            adminToken
        );


    console.log(
        "Après désactivation du membership :"
    );

    console.log(
        afterMembershipDisable.status,
        afterMembershipDisable.body
    );


    // COMPORTEMENT SÉCURISÉ ATTENDU : 401
    check(
        "Ancien JWT après désactivation membership",
        afterMembershipDisable.status,
        401
    );


    // =========================================================
    // 4. RESTAURER LE MEMBERSHIP
    // =========================================================

    await db.query(
        `
            UPDATE marega.agency_users

            SET
                active = $1

            WHERE
                user_id = $2
                AND agency_id = $3
        `,
        [
            originalMembershipActive,
            USER_ID,
            AGENCY_ID
        ]
    );


    // =========================================================
    // 5. CHANGER LE RÔLE ADMIN → AGENT
    // =========================================================

    console.log(
        "\n3) CHANGEMENT DU RÔLE ADMIN → AGENT"
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
            AGENCY_ID
        ]
    );


    const afterRoleChange =
        await get(
            "/users",
            adminToken
        );


    console.log(
        "Après changement de rôle :"
    );

    console.log(
        afterRoleChange.status,
        afterRoleChange.body
    );


    // COMPORTEMENT SÉCURISÉ ATTENDU : 403
    check(
        "Ancien JWT ADMIN après passage du compte à AGENT",
        afterRoleChange.status,
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
            AGENCY_ID
        ]
    );


    // =========================================================
    // 7. DÉSACTIVER LE COMPTE GLOBAL
    // =========================================================

    console.log(
        "\n4) DÉSACTIVATION users.active = FALSE"
    );


    await db.query(
        `
            UPDATE marega.users

            SET active = FALSE

            WHERE id = $1
        `,
        [
            USER_ID
        ]
    );


    const afterUserDisable =
        await get(
            "/buildings",
            adminToken
        );


    console.log(
        "Après désactivation du compte global :"
    );

    console.log(
        afterUserDisable.status,
        afterUserDisable.body
    );


    // COMPORTEMENT SÉCURISÉ ATTENDU : 401
    check(
        "Ancien JWT après désactivation du compte",
        afterUserDisable.status,
        401
    );


    // =========================================================
    // 8. RESTAURATION GARANTIE
    // =========================================================

    await db.query(
        `
            UPDATE marega.users

            SET active = $1

            WHERE id = $2
        `,
        [
            originalUserActive,
            USER_ID
        ]
    );


    await db.query(
        `
            UPDATE marega.agency_users

            SET
                active = $1,
                role = $2

            WHERE
                user_id = $3
                AND agency_id = $4
        `,
        [
            originalMembershipActive,
            originalRole,
            USER_ID,
            AGENCY_ID
        ]
    );


    console.log(
        "\n========================================"
    );

    console.log(
        "ÉTAT RESTAURÉ"
    );

    console.log(
        "========================================\n"
    );


    // =========================================================
    // 9. VÉRIFICATION FINALE
    // =========================================================

    const finalState =
        await db.query(
            `
                SELECT
                    u.active AS user_active,
                    au.role,
                    au.active AS membership_active

                FROM marega.users u

                INNER JOIN marega.agency_users au
                    ON au.user_id = u.id

                WHERE
                    u.id = $1
                    AND au.agency_id = $2
            `,
            [
                USER_ID,
                AGENCY_ID
            ]
        );


    console.table(
        finalState.rows
    );


    console.log(
        "\n✅ TEST TERMINÉ"
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

        // RESTAURATION DE SÉCURITÉ
        try {

            await db.query(
                `
                    UPDATE marega.users

                    SET active = TRUE

                    WHERE id = $1
                `,
                [
                    USER_ID
                ]
            );

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
                    AGENCY_ID
                ]
            );

        }
        catch (restoreError) {

            console.error(
                "❌ ÉCHEC RESTAURATION :",
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
