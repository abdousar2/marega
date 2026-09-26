require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function count(client, sql, params = []) {

    const result =
        await client.query(sql, params);

    return Number(
        result.rows[0].count
    );
}

async function main() {

    const client =
        await pool.connect();

    try {

        console.log("\n====================================================");
        console.log(" NETTOYAGE DEFINITIF MAREGA");
        console.log(" TRANSACTION + CONTROLES POST-NETTOYAGE");
        console.log("====================================================\n");

        await client.query("BEGIN");

        // ==================================================
        // 0. VERIFICATIONS DE SECURITE AVANT SUPPRESSION
        // ==================================================

        console.log("=== VERIFICATIONS AVANT SUPPRESSION ===\n");

        const protectedAgencies =
            await client.query(`
                SELECT id, name, status
                FROM marega.agencies
                WHERE id IN (1,6,7)
                ORDER BY id;
            `);

        console.table(
            protectedAgencies.rows
        );

        if (
            protectedAgencies.rows.length !== 3
        ) {

            throw new Error(
                "ERREUR : une des agences protégées 1/6/7 est absente."
            );
        }

        const protectedUsers =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.users
                WHERE id IN (1,13,14);
                `
            );

        if (protectedUsers !== 3) {

            throw new Error(
                "ERREUR : utilisateurs protégés inattendus."
            );
        }


        // ==================================================
        // 1. NETTOYAGE AUDIT AGENCES 2-5
        // ==================================================

        console.log(
            "\n=== AUDIT AGENCES TEST 2-5 ===\n"
        );

        const auditAgencyResult =
            await client.query(`
                DELETE FROM marega.audit_logs
                WHERE agency_id IN (2,3,4,5)
                RETURNING id;
            `);

        console.log(
            "Logs supprimés :",
            auditAgencyResult.rowCount
        );


        // ==================================================
        // 2. NETTOYAGE DES 14 LOGS TEST AGENCE 6
        // ==================================================

        console.log(
            "\n=== AUDIT TEST AGENCE 6 ===\n"
        );

        const testAuditIds = [
            135,
            136,
            171,
            172,
            173,
            174,
            175,
            176,
            177,
            178,
            180,
            181,
            182,
            184
        ];

        const auditAgency6 =
            await client.query(`
                DELETE FROM marega.audit_logs
                WHERE agency_id = 6
                  AND id = ANY($1::int[])
                RETURNING id;
            `, [testAuditIds]);

        console.log(
            "Logs supprimés :",
            auditAgency6.rowCount
        );


        // ==================================================
        // 3. CONTACT REQUEST DE TEST
        // ==================================================

        console.log(
            "\n=== CONTACT REQUEST TEST ===\n"
        );

        const contact =
            await client.query(`
                DELETE FROM marega.contact_requests
                WHERE id = 1
                  AND LOWER(COALESCE(name, '')) LIKE '%test%'
                RETURNING id;
            `);

        console.log(
            "Contact supprimé :",
            contact.rowCount
        );


        // ==================================================
        // 4. PAIEMENT TEST 17
        // ==================================================

        console.log(
            "\n=== PAIEMENT TEST 17 ===\n"
        );

        // Le loyer 78 référence le paiement 17.
        // On détache et restaure le loyer AVANT le DELETE.

        const rentRestore =
            await client.query(`
                UPDATE marega.rents
                SET
                    payment_id = NULL,
                    status = 'Impayé'
                WHERE id = 78
                  AND payment_id = 17
                RETURNING id, payment_id, status;
            `);

        if (rentRestore.rowCount !== 1) {

            throw new Error(
                "ERREUR : le loyer 78 n'est pas dans l'état attendu."
            );
        }

        console.log(
            "Loyer 78 restauré :",
            rentRestore.rows[0]
        );


        const paymentDelete =
            await client.query(`
                DELETE FROM marega.payments
                WHERE id = 17
                  AND agency_id = 6
                  AND lease_id = 19
                RETURNING id;
            `);

        if (paymentDelete.rowCount !== 1) {

            throw new Error(
                "ERREUR : paiement 17 non trouvé dans l'état attendu."
            );
        }

        console.log(
            "Paiement supprimé : 17"
        );


        // ==================================================
        // 5. CONTRAT TEST 27
        // ==================================================

        console.log(
            "\n=== CONTRAT TEST 27 ===\n"
        );

        const leaseRents =
            await client.query(`
                DELETE FROM marega.rents
                WHERE lease_id = 27
                RETURNING id;
            `);

        console.log(
            "Loyers contrat 27 supprimés :",
            leaseRents.rowCount
        );


        const leaseDelete =
            await client.query(`
                DELETE FROM marega.leases
                WHERE id = 27
                  AND agency_id = 6
                  AND contract_number = 'MRG-2026-000002'
                  AND identity_number = 'TEST-TXN-2028'
                RETURNING id;
            `);

        if (leaseDelete.rowCount !== 1) {

            throw new Error(
                "ERREUR : contrat 27 non trouvé dans l'état attendu."
            );
        }

        console.log(
            "Contrat supprimé : 27"
        );


        // ==================================================
        // 6. AGENCES 2-4
        // ==================================================

        console.log(
            "\n=== AGENCES 2 / 3 / 4 ===\n"
        );

        const deleteAgency234 =
            await client.query(`
                DELETE FROM marega.agencies
                WHERE id IN (2,3,4)
                RETURNING id, name;
            `);

        console.table(
            deleteAgency234.rows
        );


        // ==================================================
        // 7. AGENCE 5
        // ==================================================

        console.log(
            "\n=== AGENCE 5 ===\n"
        );

        const agency5Check =
            await client.query(`
                SELECT
                    id,
                    name,
                    email,
                    status
                FROM marega.agencies
                WHERE id = 5;
            `);

        if (
            agency5Check.rowCount !== 1 ||
            agency5Check.rows[0].name !== "Agence Test 4"
        ) {

            throw new Error(
                "ERREUR : l'agence 5 ne correspond pas au profil de test attendu."
            );
        }


        // Les contraintes RESTRICT imposent cet ordre.
        await client.query(`
            DELETE FROM marega.tenants
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.apartments
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.buildings
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.leases
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.rents
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.payments
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.expenses
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.document_templates
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.agency_terms
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.landlords
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.agency_settings
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.agency_users
            WHERE agency_id = 5;
        `);

        await client.query(`
            DELETE FROM marega.agencies
            WHERE id = 5
              AND name = 'Agence Test 4';
        `);

        console.log(
            "Agence 5 supprimée."
        );


        // ==================================================
        // 8. UTILISATEURS TEST
        // ==================================================

        console.log(
            "\n=== UTILISATEURS TEST ===\n"
        );

        const deleteUsers =
            await client.query(`
                DELETE FROM marega.users
                WHERE id IN (7,8,9,10,12,15)
                RETURNING id, email;
            `);

        console.table(
            deleteUsers.rows
        );


        // ==================================================
        // 9. VERIFICATIONS POST-NETTOYAGE
        // ==================================================

        console.log(
            "\n===================================================="
        );

        console.log(
            " VERIFICATIONS POST-NETTOYAGE"
        );

        console.log(
            "====================================================\n"
        );


        const remainingAgencies =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.agencies
                WHERE id IN (2,3,4,5);
                `
            );

        const remainingUsers =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.users
                WHERE id IN (7,8,9,10,12,15);
                `
            );

        const remainingLease =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.leases
                WHERE id = 27;
                `
            );

        const remainingLeaseRents =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.rents
                WHERE lease_id = 27;
                `
            );

        const remainingPayment =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.payments
                WHERE id = 17;
                `
            );

        const rent78 =
            await client.query(`
                SELECT
                    id,
                    status,
                    payment_id,
                    agency_id
                FROM marega.rents
                WHERE id = 78;
            `);

        const remainingAudit =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.audit_logs
                WHERE id = ANY($1::int[]);
                `,
                [testAuditIds]
            );

        const remainingContact =
            await count(
                client,
                `
                SELECT COUNT(*)::int AS count
                FROM marega.contact_requests
                WHERE id = 1;
                `
            );


        console.log(
            "Agences test restantes      :",
            remainingAgencies
        );

        console.log(
            "Utilisateurs test restants :",
            remainingUsers
        );

        console.log(
            "Contrat 27 restant         :",
            remainingLease
        );

        console.log(
            "Loyers contrat 27 restants :",
            remainingLeaseRents
        );

        console.log(
            "Paiement 17 restant        :",
            remainingPayment
        );

        console.log(
            "Audit test restant         :",
            remainingAudit
        );

        console.log(
            "Contact test restant       :",
            remainingContact
        );

        console.log(
            "Etat loyer 78              :"
        );

        console.table(
            rent78.rows
        );


        // ==================================================
        // 10. PROTECTION DES DONNEES LEGITIMES
        // ==================================================

        const protectedData =
            await client.query(`
                SELECT
                    a.id,
                    a.name,
                    (
                        SELECT COUNT(*)
                        FROM marega.leases l
                        WHERE l.agency_id = a.id
                    ) AS leases,
                    (
                        SELECT COUNT(*)
                        FROM marega.payments p
                        WHERE p.agency_id = a.id
                    ) AS payments
                FROM marega.agencies a
                WHERE a.id IN (1,6,7)
                ORDER BY a.id;
            `);

        console.log(
            "\nAGENCES PROTEGEES APRES NETTOYAGE :"
        );

        console.table(
            protectedData.rows
        );


        // ==================================================
        // 11. VERIFICATIONS BLOQUANTES
        // ==================================================

        if (remainingAgencies !== 0) {
            throw new Error(
                "ECHEC : des agences de test existent encore."
            );
        }

        if (remainingUsers !== 0) {
            throw new Error(
                "ECHEC : des utilisateurs de test existent encore."
            );
        }

        if (remainingLease !== 0) {
            throw new Error(
                "ECHEC : le contrat 27 existe encore."
            );
        }

        if (remainingLeaseRents !== 0) {
            throw new Error(
                "ECHEC : des loyers du contrat 27 existent encore."
            );
        }

        if (remainingPayment !== 0) {
            throw new Error(
                "ECHEC : le paiement 17 existe encore."
            );
        }

        if (remainingAudit !== 0) {
            throw new Error(
                "ECHEC : des audits explicitement ciblés existent encore."
            );
        }

        if (remainingContact !== 0) {
            throw new Error(
                "ECHEC : le contact request de test existe encore."
            );
        }

        if (
            rent78.rowCount !== 1 ||
            rent78.rows[0].status !== "Impayé" ||
            rent78.rows[0].payment_id !== null ||
            Number(rent78.rows[0].agency_id) !== 6
        ) {

            throw new Error(
                "ECHEC : le loyer 78 n'a pas été restauré correctement."
            );
        }


        // ==================================================
        // 12. COMMIT
        // ==================================================

        await client.query("COMMIT");

        console.log(
            "\n===================================================="
        );

        console.log(
            " ✅ NETTOYAGE COMMIT"
        );

        console.log(
            "====================================================\n"
        );

    } catch (err) {

        console.error(
            "\n❌ ERREUR — ROLLBACK"
        );

        console.error(
            err.message
        );

        try {
            await client.query("ROLLBACK");
        } catch {}

        process.exitCode = 1;

    } finally {

        client.release();
        await pool.end();

    }
}

main();
