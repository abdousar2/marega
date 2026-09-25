const db = require("./src/config/database");

async function query(label, sql) {

    const result = await db.query(sql);

    console.log(`\n${label}`);
    console.log("=".repeat(label.length));

    if (result.rows.length === 0) {

        console.log("✅ Aucune anomalie");

    } else {

        console.table(result.rows);

    }

    return result.rows;

}

async function run() {

    console.log("\n========================================");
    console.log("CONTRÔLE TRANSVERSE D'INTÉGRITÉ FINANCIÈRE");
    console.log("========================================\n");

    let totalAnomalies = 0;


    // =========================================================
    // 1. PAYMENT → TENANT / LEASE / APARTMENT / BUILDING
    // =========================================================

    const paymentRelations = await query(

        "1) COHÉRENCE PAYMENT → RELATIONS",

        `
        SELECT
            p.id AS payment_id,
            p.agency_id AS payment_agency,
            p.tenant_id,
            p.lease_id,

            t.agency_id AS tenant_agency,
            l.agency_id AS lease_agency,
            l.tenant_id AS lease_tenant,

            a.id AS apartment_id,
            a.agency_id AS apartment_agency,

            b.id AS building_id,
            b.agency_id AS building_agency

        FROM marega.payments p

        LEFT JOIN marega.tenants t
            ON t.id = p.tenant_id

        LEFT JOIN marega.leases l
            ON l.id = p.lease_id

        LEFT JOIN marega.apartments a
            ON a.id = l.apartment_id

        LEFT JOIN marega.buildings b
            ON b.id = a.building_id

        WHERE
            t.id IS NULL
            OR l.id IS NULL
            OR a.id IS NULL
            OR b.id IS NULL

            OR p.agency_id IS DISTINCT FROM t.agency_id
            OR p.agency_id IS DISTINCT FROM l.agency_id
            OR p.agency_id IS DISTINCT FROM a.agency_id
            OR p.agency_id IS DISTINCT FROM b.agency_id

            OR p.tenant_id IS DISTINCT FROM l.tenant_id
        `
    );

    totalAnomalies +=
        paymentRelations.length;


    // =========================================================
    // 2. RENT → LEASE / TENANT / AGENCY
    // =========================================================

    const rentRelations = await query(

        "2) COHÉRENCE RENT → LEASE / TENANT",

        `
        SELECT
            r.id AS rent_id,
            r.agency_id AS rent_agency,
            r.lease_id,
            r.tenant_id,

            l.agency_id AS lease_agency,
            l.tenant_id AS lease_tenant,

            t.agency_id AS tenant_agency

        FROM marega.rents r

        LEFT JOIN marega.leases l
            ON l.id = r.lease_id

        LEFT JOIN marega.tenants t
            ON t.id = r.tenant_id

        WHERE
            l.id IS NULL
            OR t.id IS NULL

            OR r.agency_id IS DISTINCT FROM l.agency_id
            OR r.agency_id IS DISTINCT FROM t.agency_id

            OR r.tenant_id IS DISTINCT FROM l.tenant_id
        `
    );

    totalAnomalies +=
        rentRelations.length;


    // =========================================================
    // 3. RENT PAYMENT_LINK → PAYMENT
    // =========================================================

    const rentPayments = await query(

        "3) COHÉRENCE RENT.payment_id → PAYMENT",

        `
        SELECT
            r.id AS rent_id,
            r.payment_id,

            r.agency_id AS rent_agency,
            r.lease_id AS rent_lease,
            r.tenant_id AS rent_tenant,
            r.status AS rent_status,

            p.agency_id AS payment_agency,
            p.lease_id AS payment_lease,
            p.tenant_id AS payment_tenant,
            p.status AS payment_status

        FROM marega.rents r

        LEFT JOIN marega.payments p
            ON p.id = r.payment_id

        WHERE
            r.payment_id IS NOT NULL

            AND (
                p.id IS NULL

                OR r.agency_id IS DISTINCT FROM p.agency_id

                OR r.lease_id IS DISTINCT FROM p.lease_id

                OR r.tenant_id IS DISTINCT FROM p.tenant_id

                OR r.status IS DISTINCT FROM 'Payé'

                OR p.status IS DISTINCT FROM 'Payé'
            )
        `
    );

    totalAnomalies +=
        rentPayments.length;


    // =========================================================
    // 4. LOYERS PAYÉS SANS PAYMENT
    // =========================================================

    const paidWithoutPayment = await query(

        "4) RENT PAYÉ SANS PAYMENT",

        `
        SELECT
            r.id AS rent_id,
            r.agency_id,
            r.lease_id,
            r.tenant_id,
            r.status,
            r.payment_id

        FROM marega.rents r

        WHERE
            r.status = 'Payé'
            AND r.payment_id IS NULL
        `
    );

    totalAnomalies +=
        paidWithoutPayment.length;


    // =========================================================
    // 5. PAYMENT → AGENCY
    // =========================================================

    const paymentAgencies = await query(

        "5) PAYMENT → AGENCY EXISTANTE",

        `
        SELECT
            p.id AS payment_id,
            p.agency_id

        FROM marega.payments p

        LEFT JOIN marega.agencies ag
            ON ag.id = p.agency_id

        WHERE
            ag.id IS NULL
        `
    );

    totalAnomalies +=
        paymentAgencies.length;


    // =========================================================
    // 6. RENT → AGENCY
    // =========================================================

    const rentAgencies = await query(

        "6) RENT → AGENCY EXISTANTE",

        `
        SELECT
            r.id AS rent_id,
            r.agency_id

        FROM marega.rents r

        LEFT JOIN marega.agencies ag
            ON ag.id = r.agency_id

        WHERE
            ag.id IS NULL
        `
    );

    totalAnomalies +=
        rentAgencies.length;


    // =========================================================
    // 7. DOUBLONS DE RECEIPT_PATH
    // =========================================================

    const duplicateReceipts = await query(

        "7) RECEIPT_PATH DUPLIQUÉS",

        `
        SELECT
            receipt_path,
            COUNT(*) AS occurrences,
            ARRAY_AGG(id ORDER BY id) AS payment_ids

        FROM marega.payments

        WHERE
            receipt_path IS NOT NULL

        GROUP BY
            receipt_path

        HAVING
            COUNT(*) > 1
        `
    );

    totalAnomalies +=
        duplicateReceipts.length;


    // =========================================================
    // 8. AUDIT USER → AGENCY
    // =========================================================

    const auditUsers = await query(

        "8) COHÉRENCE AUDIT USER → AGENCY",

        `
        SELECT
            a.id AS audit_id,
            a.user_id,
            a.agency_id,
            au.agency_id AS membership_agency

        FROM marega.audit_logs a

        LEFT JOIN marega.agency_users au

            ON au.user_id = a.user_id
            AND au.agency_id = a.agency_id

        WHERE
            a.user_id IS NOT NULL

            AND au.user_id IS NULL
        `
    );

    totalAnomalies +=
        auditUsers.length;


    // =========================================================
    // 9. AUDIT PAYMENT → AGENCY
    // =========================================================

    const auditPayments = await query(

        "9) COHÉRENCE AUDIT PAYMENTS → AGENCY",

        `
        SELECT
            a.id AS audit_id,
            a.agency_id AS audit_agency,
            a.entity_id,

            p.id AS payment_id,
            p.agency_id AS payment_agency,

            a.action,
            a.module

        FROM marega.audit_logs a

        LEFT JOIN marega.payments p

            ON p.id::text =
               a.entity_id::text

        WHERE
            a.module = 'payments'

            AND a.entity_id IS NOT NULL

            AND (
                p.id IS NULL

                OR a.agency_id IS DISTINCT FROM p.agency_id
            )
        `
    );

    totalAnomalies +=
        auditPayments.length;


    // =========================================================
    // 10. AUDIT → AGENCY EXISTANTE
    // =========================================================

    const auditAgencies = await query(

        "10) AUDIT → AGENCY EXISTANTE",

        `
        SELECT
            a.id AS audit_id,
            a.agency_id

        FROM marega.audit_logs a

        LEFT JOIN marega.agencies ag
            ON ag.id = a.agency_id

        WHERE
            a.agency_id IS NOT NULL
            AND ag.id IS NULL
        `
    );

    totalAnomalies +=
        auditAgencies.length;


    // =========================================================
    // 11. RÉSUMÉ PAR AGENCE
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "11) RÉSUMÉ FINANCIER PAR AGENCE"
    );

    console.log(
        "========================================"
    );

    const summary =
        await db.query(

            `
            SELECT

                ag.id AS agency_id,
                ag.name AS agency_name,

                (
                    SELECT COUNT(*)
                    FROM marega.rents r
                    WHERE r.agency_id = ag.id
                ) AS rents,

                (
                    SELECT COUNT(*)
                    FROM marega.payments p
                    WHERE p.agency_id = ag.id
                ) AS payments,

                (
                    SELECT COUNT(*)
                    FROM marega.audit_logs a
                    WHERE a.agency_id = ag.id
                      AND a.module = 'payments'
                ) AS payment_audits

            FROM marega.agencies ag

            ORDER BY
                ag.id
            `
        );

    console.table(
        summary.rows
    );


    // =========================================================
    // 12. RÉSULTAT FINAL
    // =========================================================

    console.log(
        "\n========================================"
    );

    console.log(
        "RÉSULTAT DU CONTRÔLE"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Anomalies détectées : ${totalAnomalies}`
    );

    if (totalAnomalies === 0) {

        console.log(
            "\n✅ INTÉGRITÉ TRANSVERSE VALIDÉE"
        );

        console.log(
            "Toutes les relations financières vérifiées sont cohérentes."
        );

    } else {

        console.log(
            "\n❌ DES ANOMALIES ONT ÉTÉ DÉTECTÉES"
        );

        process.exitCode = 1;

    }

}

run()

    .catch(error => {

        console.error(
            "\n❌ ERREUR DU CONTRÔLE :"
        );

        console.error(error);

        process.exitCode = 1;

    })

    .finally(() => {

        setTimeout(() => {
            process.exit();
        }, 500);

    });
