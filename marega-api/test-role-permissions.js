require("dotenv").config();

const jwt = require("jsonwebtoken");
const db = require("./src/config/database");

const API =
    process.env.TEST_API_URL ||
    "http://localhost:5000/api";

const AGENCY_ID = 6;
const TEST_USER_ID = 13;

const ROLES = [
    "ADMIN",
    "RESPONSABLE",
    "COMPTABLE",
    "AGENT"
];


function tokenFor(role) {

    return jwt.sign(

        {
            id: TEST_USER_ID,
            email: "role-test@marega.local",
            role,
            agency_id: AGENCY_ID,
            agency_name: "TEST ROLE"
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "10m"
        }

    );

}


async function request(
    role,
    method,
    path,
    body = undefined
) {

    const response =
        await fetch(
            `${API}${path}`,

            {
                method,

                headers: {

                    Authorization:
                        `Bearer ${tokenFor(role)}`,

                    ...(body !== undefined
                        ? {
                            "Content-Type":
                                "application/json"
                        }
                        : {})

                },

                body:
                    body !== undefined
                        ? JSON.stringify(body)
                        : undefined

            }
        );

    let data = null;

    try {
        data = await response.json();
    }

    catch {
        data = null;
    }

    return {
        status: response.status,
        data
    };

}


function expectAllowed(
    label,
    role,
    result
) {

    if (result.status === 403) {

        console.log(
            `❌ ${label} | ${role} | HTTP 403`
        );

        return false;

    }

    console.log(
        `✅ ${label} | ${role} | HTTP ${result.status}`
    );

    return true;

}


function expectDenied(
    label,
    role,
    result
) {

    if (result.status !== 403) {

        console.log(
            `❌ ${label} | ${role} | HTTP ${result.status} attendu 403`
        );

        return false;

    }

    console.log(
        `✅ ${label} | ${role} | HTTP 403`
    );

    return true;

}


async function run() {

    console.log("\n========================================");
    console.log("TEST PERMISSIONS PAR RÔLE");
    console.log("========================================\n");

    console.log(
        "API :",
        API
    );


    // =========================================================
    // 1. ÉTAT RÉEL DES RÔLES DANS L'AGENCE 6
    // =========================================================

    const members =
        await db.query(
            `
            SELECT
                au.user_id,
                au.agency_id,
                au.role,
                au.active AS membership_active,

                u.active AS user_active,
                u.email

            FROM marega.agency_users au

            JOIN marega.users u
                ON u.id = au.user_id

            WHERE au.agency_id = $1

            ORDER BY
                au.role,
                au.user_id
            `,
            [AGENCY_ID]
        );

    console.log(
        "\nUTILISATEURS ACTUELS AGENCE 6 :"
    );

    console.table(
        members.rows
    );


    let failures = 0;


    // =========================================================
    // 2. LECTURES — TOUS LES RÔLES
    // =========================================================

    const readTests = [

        [
            "Buildings GET",
            "GET",
            "/buildings"
        ],

        [
            "Apartments GET",
            "GET",
            "/apartments"
        ],

        [
            "Tenants GET",
            "GET",
            "/tenants"
        ],

        [
            "Leases GET",
            "GET",
            "/leases"
        ],

        [
            "Payments GET",
            "GET",
            "/payments"
        ],

        [
            "Rents GET",
            "GET",
            "/rents"
        ]

    ];


    console.log(
        "\n========================================"
    );

    console.log(
        "1) LECTURE — TOUS LES RÔLES"
    );

    console.log(
        "========================================\n"
    );


    for (
        const [label, method, path]
        of readTests
    ) {

        for (
            const role
            of ROLES
        ) {

            const result =
                await request(
                    role,
                    method,
                    path
                );

            if (
                !expectAllowed(
                    label,
                    role,
                    result
                )
            ) {
                failures++;
            }

        }

    }


    // =========================================================
    // 3. USERS — ADMIN UNIQUEMENT
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "2) USERS — ADMIN UNIQUEMENT"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "GET",
                "/users"
            );

        const ok =
            role === "ADMIN"

                ? expectAllowed(
                    "Users GET",
                    role,
                    result
                )

                : expectDenied(
                    "Users GET",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 4. AUDIT — ADMIN UNIQUEMENT
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "3) AUDIT — ADMIN UNIQUEMENT"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "GET",
                "/audit"
            );

        const ok =
            role === "ADMIN"

                ? expectAllowed(
                    "Audit GET",
                    role,
                    result
                )

                : expectDenied(
                    "Audit GET",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 5. BUILDINGS — CREATE
    // ADMIN / RESPONSABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "4) BUILDINGS CREATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "POST",
                "/buildings",
                {}
            );

        const allowed =
            [
                "ADMIN",
                "RESPONSABLE"
            ].includes(role);

        const ok =
            allowed

                ? expectAllowed(
                    "Buildings POST",
                    role,
                    result
                )

                : expectDenied(
                    "Buildings POST",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 6. BUILDINGS UPDATE
    // ADMIN / RESPONSABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "5) BUILDINGS UPDATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "PUT",
                "/buildings/999999999",
                {}
            );

        const allowed =
            [
                "ADMIN",
                "RESPONSABLE"
            ].includes(role);

        const ok =
            allowed

                ? expectAllowed(
                    "Buildings PUT",
                    role,
                    result
                )

                : expectDenied(
                    "Buildings PUT",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 7. TENANTS — UPDATE
    // ADMIN / RESPONSABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "6) TENANTS UPDATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "PUT",
                "/tenants/999999999",
                {}
            );


        const allowed =
            [
                "ADMIN",
                "RESPONSABLE"
            ].includes(role);


        const ok =
            allowed

                ? expectAllowed(
                    "Tenants PUT",
                    role,
                    result
                )

                : expectDenied(
                    "Tenants PUT",
                    role,
                    result
                );


        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 8. LEASES — UPDATE
    // ADMIN / RESPONSABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "7) LEASES UPDATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "PUT",
                "/leases/999999999",
                {}
            );


        const allowed =
            [
                "ADMIN",
                "RESPONSABLE"
            ].includes(role);


        const ok =
            allowed

                ? expectAllowed(
                    "Leases PUT",
                    role,
                    result
                )

                : expectDenied(
                    "Leases PUT",
                    role,
                    result
                );


        if (!ok) {
            failures++;
        }

    }


    


    // =========================================================
    // 9. LEASES — CREATE
    // ADMIN / RESPONSABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "8) LEASE CREATE"
    );

    console.log(
        "========================================\n"
    );


    // ---------------------------------------------------------
    // RÉCUPÉRER DES RELATIONS VALIDES DE L'AGENCE
    // ---------------------------------------------------------

    const leasePermissionRefs =
        await db.query(
            `
                SELECT
                    a.id AS apartment_id,
                    t.id AS tenant_id

                FROM marega.apartments a

                INNER JOIN marega.tenants t
                    ON t.agency_id = a.agency_id

                WHERE a.agency_id = $1

                ORDER BY
                    a.id,
                    t.id

                LIMIT 1
            `,
            [
                AGENCY_ID
            ]
        );


    if (
        leasePermissionRefs.rows.length === 0
    ) {

        throw new Error(
            "Impossible de préparer le test LEASE CREATE : aucun appartement/locataire disponible dans l'agence 6."
        );

    }


    const {
        apartment_id,
        tenant_id
    } =
        leasePermissionRefs.rows[0];


    console.log(
        "Références utilisées :",
        {
            apartment_id,
            tenant_id
        }
    );


    // ---------------------------------------------------------
    // TEST PAR RÔLE
    // ---------------------------------------------------------

    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "POST",
                "/leases",

                {
                    apartment_id,
                    tenant_id,

                    // DATES VOLONTAIREMENT INVALIDES
                    start_date:
                        "2035-02-01",

                    end_date:
                        "2035-01-01",

                    monthly_rent:
                        200000,

                    charges:
                        0,

                    deposit:
                        0,

                    payment_day:
                        5,

                    status:
                        "Actif",

                    notes:
                        "TEST PERMISSIONS ROLE - CREATE LEASE"
                }
            );


        const allowed =
            [
                "ADMIN",
                "RESPONSABLE"
            ].includes(role);


        let ok;


        if (allowed) {

            ok =
                result.status === 400;


            console.log(
                ok
                    ? `✅ Leases POST | ${role} | HTTP 400`
                    : `❌ Leases POST | ${role} | HTTP ${result.status} attendu 400`
            );

        }

        else {

            ok =
                result.status === 403;


            console.log(
                ok
                    ? `✅ Leases POST | ${role} | HTTP 403`
                    : `❌ Leases POST | ${role} | HTTP ${result.status} attendu 403`
            );

        }


        if (!ok) {
            failures++;
        }

    }

    // =========================================================
    // 10. PAYMENTS UPDATE
    // ADMIN / RESPONSABLE / COMPTABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "9) PAYMENTS UPDATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "PUT",
                "/payments/999999999",
                {}
            );

        const allowed =
            [
                "ADMIN",
                "RESPONSABLE",
                "COMPTABLE"
            ].includes(role);

        const ok =
            allowed

                ? expectAllowed(
                    "Payments PUT",
                    role,
                    result
                )

                : expectDenied(
                    "Payments PUT",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 11. PAYMENTS DELETE
    // ADMIN UNIQUEMENT
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "10) PAYMENTS DELETE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "DELETE",
                "/payments/999999999"
            );

        const ok =
            role === "ADMIN"

                ? expectAllowed(
                    "Payments DELETE",
                    role,
                    result
                )

                : expectDenied(
                    "Payments DELETE",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 12. EXPENSES CREATE
    // ADMIN / RESPONSABLE / COMPTABLE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "11) EXPENSES CREATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "POST",
                "/expenses",
                {}
            );

        const allowed =
            [
                "ADMIN",
                "RESPONSABLE",
                "COMPTABLE"
            ].includes(role);

        const ok =
            allowed

                ? expectAllowed(
                    "Expenses POST",
                    role,
                    result
                )

                : expectDenied(
                    "Expenses POST",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 13. USERS CREATE
    // ADMIN UNIQUEMENT
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "12) USERS CREATE"
    );

    console.log(
        "========================================\n"
    );


    for (
        const role
        of ROLES
    ) {

        const result =
            await request(
                role,
                "POST",
                "/users",
                {}
            );

        const ok =
            role === "ADMIN"

                ? expectAllowed(
                    "Users POST",
                    role,
                    result
                )

                : expectDenied(
                    "Users POST",
                    role,
                    result
                );

        if (!ok) {
            failures++;
        }

    }


    // =========================================================
    // 14. RÉSULTAT
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "RÉSULTAT"
    );

    console.log(
        "========================================\n"
    );

    console.log(
        `Échecs : ${failures}`
    );

    if (failures === 0) {

        console.log(
            "\n✅ CONTRÔLE DES PERMISSIONS RÉUSSI"
        );

    } else {

        console.log(
            "\n❌ DES ÉCARTS DE PERMISSIONS ONT ÉTÉ DÉTECTÉS"
        );

        process.exitCode = 1;

    }

}

run()

    .catch(error => {

        console.error(
            "\n❌ TEST ÉCHOUÉ :"
        );

        console.error(error);

        process.exitCode = 1;

    })

    .finally(() => {

        setTimeout(() => {
            process.exit();
        }, 700);

    });
