require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const SCHEMA = "marega";

async function q(client, sql, params = []) {
    const result = await client.query(sql, params);
    return result.rows;
}

async function main() {

    const client = await pool.connect();

    try {

        console.log("\n====================================================");
        console.log(" PREVIEW NETTOYAGE — AUCUNE MODIFICATION");
        console.log("====================================================\n");


        // ====================================================
        // 1. AGENCES + VOLUMES
        // ====================================================

        console.log("=== AGENCES ET DONNEES LIEES ===\n");

        const agencies = await q(client, `
            SELECT
                a.id,
                a.name,
                a.status,
                a.email,
                a.created_at,

                (
                    SELECT COUNT(*)
                    FROM marega.agency_users au
                    WHERE au.agency_id = a.id
                ) AS users,

                (
                    SELECT COUNT(*)
                    FROM marega.buildings b
                    WHERE b.agency_id = a.id
                ) AS buildings,

                (
                    SELECT COUNT(*)
                    FROM marega.apartments ap
                    WHERE ap.agency_id = a.id
                ) AS apartments,

                (
                    SELECT COUNT(*)
                    FROM marega.tenants t
                    WHERE t.agency_id = a.id
                ) AS tenants,

                (
                    SELECT COUNT(*)
                    FROM marega.leases l
                    WHERE l.agency_id = a.id
                ) AS leases,

                (
                    SELECT COUNT(*)
                    FROM marega.rents r
                    WHERE r.agency_id = a.id
                ) AS rents,

                (
                    SELECT COUNT(*)
                    FROM marega.payments p
                    WHERE p.agency_id = a.id
                ) AS payments,

                (
                    SELECT COUNT(*)
                    FROM marega.expenses e
                    WHERE e.agency_id = a.id
                ) AS expenses

            FROM marega.agencies a
            ORDER BY a.id;
        `);

        console.table(agencies);


        // ====================================================
        // 2. COMPTES UTILISATEURS SUSPECTS
        // ====================================================

        console.log("\n=== UTILISATEURS SUSPECTS ===\n");

        const users = await q(client, `
            SELECT
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.active,
                au.agency_id,
                au.role,
                au.active AS membership_active
            FROM marega.users u
            LEFT JOIN marega.agency_users au
                ON au.user_id = u.id
            WHERE
                LOWER(COALESCE(u.email, '')) LIKE '%test%'
                OR LOWER(COALESCE(u.email, '')) LIKE '%isolation%'
                OR LOWER(COALESCE(u.email, '')) LIKE '%demo%'
                OR LOWER(COALESCE(u.first_name, '')) LIKE '%test%'
                OR LOWER(COALESCE(u.last_name, '')) LIKE '%test%'
                OR au.agency_id IN (2,3,4,5)
            ORDER BY u.id;
        `);

        console.table(users);


        // ====================================================
        // 3. DONNEES DES AGENCES TEST 2/3/4/5
        // ====================================================

        const testAgencies = [2, 3, 4, 5];

        for (const agencyId of testAgencies) {

            console.log("\n====================================================");
            console.log(` AGENCE ${agencyId}`);
            console.log("====================================================\n");


            const agency = await q(client, `
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
                    logo_path,
                    contract_template_path,
                    receipt_template_path
                FROM marega.agencies
                WHERE id = $1;
            `, [agencyId]);

            console.log("AGENCE :");
            console.table(agency);


            for (const table of [
                "buildings",
                "apartments",
                "tenants",
                "leases",
                "rents",
                "payments",
                "expenses"
            ]) {

                const rows = await q(client, `
                    SELECT *
                    FROM marega."${table}"
                    WHERE agency_id = $1
                    ORDER BY id;
                `, [agencyId]);

                console.log(`\n${table} (${rows.length})`);

                if (rows.length > 0) {
                    console.table(rows);
                }
            }


            const agencyUsers = await q(client, `
                SELECT
                    u.id,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.active,
                    au.role,
                    au.active AS membership_active
                FROM marega.users u
                JOIN marega.agency_users au
                    ON au.user_id = u.id
                WHERE au.agency_id = $1
                ORDER BY u.id;
            `, [agencyId]);

            console.log("\nUTILISATEURS :");
            console.table(agencyUsers);
        }


        // ====================================================
        // 4. CONTACT REQUESTS SUSPECTES
        // ====================================================

        console.log("\n====================================================");
        console.log(" CONTACT REQUESTS SUSPECTES");
        console.log("====================================================\n");

        const contacts = await q(client, `
            SELECT *
            FROM marega.contact_requests
            WHERE
                LOWER(COALESCE(name, '')) LIKE '%test%'
                OR LOWER(COALESCE(email, '')) LIKE '%test%'
                OR LOWER(COALESCE(company, '')) LIKE '%test%'
                OR LOWER(COALESCE(message, '')) LIKE '%test%'
            ORDER BY id;
        `);

        console.table(contacts);


        // ====================================================
        // 5. TEMPLATES DOCUMENTAIRES SUSPECTS
        // ====================================================

        console.log("\n====================================================");
        console.log(" DOCUMENT TEMPLATES SUSPECTS");
        console.log("====================================================\n");

        const templates = await q(client, `
            SELECT
                id,
                name,
                source_document_path,
                created_at,
                updated_at
            FROM marega.document_templates
            WHERE
                LOWER(COALESCE(name, '')) LIKE '%test%'
                OR LOWER(COALESCE(source_document_path, '')) LIKE '%test%'
                OR LOWER(COALESCE(definition::text, '')) LIKE '%test%'
            ORDER BY id;
        `);

        console.table(templates);


        // ====================================================
        // 6. LEASES / PAIEMENTS AVEC MARQUEURS
        // ====================================================

        console.log("\n====================================================");
        console.log(" CONTRATS SUSPECTS");
        console.log("====================================================\n");

        const leases = await q(client, `
            SELECT *
            FROM marega.leases
            WHERE
                LOWER(COALESCE(notes, '')) LIKE '%test%'
                OR LOWER(COALESCE(identity_number, '')) LIKE '%test%'
                OR LOWER(COALESCE(notes, '')) LIKE '%simulation%'
                OR LOWER(COALESCE(notes, '')) LIKE '%transaction%'
            ORDER BY id;
        `);

        console.table(leases);


        console.log("\n====================================================");
        console.log(" PAIEMENTS SUSPECTS");
        console.log("====================================================\n");

        const payments = await q(client, `
            SELECT *
            FROM marega.payments
            WHERE
                LOWER(COALESCE(reference, '')) LIKE '%test%'
                OR LOWER(COALESCE(notes, '')) LIKE '%test%'
                OR LOWER(COALESCE(reference, '')) LIKE '%simulation%'
                OR LOWER(COALESCE(notes, '')) LIKE '%transaction%'
            ORDER BY id;
        `);

        console.table(payments);


        // ====================================================
        // 7. LOGS D'AUDIT SUSPECTS
        // ====================================================

        console.log("\n====================================================");
        console.log(" AUDIT — MARQUEURS DE TEST");
        console.log("====================================================\n");

        const audit = await q(client, `
            SELECT
                id,
                agency_id,
                user_id,
                module,
                action,
                entity_id,
                created_at,
                details
            FROM marega.audit_logs
            WHERE
                CAST(details AS text) ~* '(test|simulation|demo|transaction|contrat-loyers)'
            ORDER BY id;
        `);

        console.table(audit);


        // ====================================================
        // 8. FIN
        // ====================================================

        console.log("\n====================================================");
        console.log(" PREVIEW TERMINE");
        console.log(" AUCUNE DONNEE N'A ETE MODIFIEE");
        console.log("====================================================\n");

    } finally {

        client.release();
        await pool.end();

    }
}

main().catch(err => {

    console.error("\n❌ ERREUR PREVIEW :", err);

    process.exit(1);

});
