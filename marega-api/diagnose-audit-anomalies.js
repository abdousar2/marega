const db = require("./src/config/database");

async function run() {

    console.log("\n========================================");
    console.log("DIAGNOSTIC DES 35 ANOMALIES");
    console.log("========================================\n");

    // =========================================================
    // 1. UTILISATEUR 6
    // =========================================================

    const user6 = await db.query(
        `
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.active,

            au.agency_id,
            au.role,
            au.active AS membership_active,
            au.suspended_by_agency

        FROM marega.users u

        LEFT JOIN marega.agency_users au
            ON au.user_id = u.id

        WHERE u.id = 6

        ORDER BY au.agency_id
        `
    );

    console.log("1) UTILISATEUR 6 ET SES RATTACHEMENTS");
    console.table(user6.rows);


    // =========================================================
    // 2. AUDITS SANS AGENCE
    // =========================================================

    const nullAgencyAudits = await db.query(
        `
        SELECT
            id,
            user_id,
            agency_id,
            action,
            module,
            entity_id,
            details,
            ip_address,
            user_agent,
            created_at

        FROM marega.audit_logs

        WHERE
            user_id IS NOT NULL
            AND agency_id IS NULL

        ORDER BY
            id
        `
    );

    console.log(
        "\n2) AUDITS AVEC user_id MAIS agency_id NULL"
    );

    console.table(
        nullAgencyAudits.rows
    );


    // =========================================================
    // 3. RÉSUMÉ DE CES AUDITS
    // =========================================================

    const nullAgencySummary = await db.query(
        `
        SELECT
            user_id,
            module,
            action,
            COUNT(*) AS occurrences

        FROM marega.audit_logs

        WHERE
            user_id IS NOT NULL
            AND agency_id IS NULL

        GROUP BY
            user_id,
            module,
            action

        ORDER BY
            user_id,
            module,
            action
        `
    );

    console.log(
        "\n3) RÉSUMÉ DES AUDITS SANS AGENCE"
    );

    console.table(
        nullAgencySummary.rows
    );


    // =========================================================
    // 4. AUDITS PAYMENTS ORPHELINS
    // =========================================================

    const orphanPaymentAudits = await db.query(
        `
        SELECT

            a.id AS audit_id,
            a.agency_id,
            a.user_id,
            a.action,
            a.module,
            a.entity_id,
            a.details,
            a.created_at,

            p.id AS payment_id

        FROM marega.audit_logs a

        LEFT JOIN marega.payments p
            ON p.id::text =
               a.entity_id::text

        WHERE
            a.module = 'payments'
            AND a.entity_id IS NOT NULL
            AND p.id IS NULL

        ORDER BY
            a.id
        `
    );

    console.log(
        "\n4) AUDITS PAYMENTS SANS PAYMENT CORRESPONDANT"
    );

    console.table(
        orphanPaymentAudits.rows
    );


    // =========================================================
    // 5. RÉSUMÉ
    // =========================================================

    const orphanSummary = await db.query(
        `
        SELECT
            a.agency_id,
            a.action,
            COUNT(*) AS occurrences

        FROM marega.audit_logs a

        LEFT JOIN marega.payments p
            ON p.id::text =
               a.entity_id::text

        WHERE
            a.module = 'payments'
            AND a.entity_id IS NOT NULL
            AND p.id IS NULL

        GROUP BY
            a.agency_id,
            a.action

        ORDER BY
            a.agency_id,
            a.action
        `
    );

    console.log(
        "\n5) RÉSUMÉ DES AUDITS PAYMENTS ORPHELINS"
    );

    console.table(
        orphanSummary.rows
    );


    console.log(
        "\n========================================"
    );

    console.log(
        "✅ DIAGNOSTIC TERMINÉ — AUCUNE DONNÉE MODIFIÉE"
    );

    console.log(
        "========================================\n"
    );

}

run()

    .catch(error => {

        console.error(
            "\n❌ DIAGNOSTIC ÉCHOUÉ :"
        );

        console.error(error);

        process.exitCode = 1;

    })

    .finally(() => {

        setTimeout(() => {
            process.exit();
        }, 500);

    });
