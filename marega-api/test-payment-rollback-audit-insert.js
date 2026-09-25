const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");
const AuditLog = require("./src/models/audit.model");
const fs = require("fs");
const path = require("path");

async function run() {

    const agencyId = 6;
    const rentId = 79;
    const testReference = `TEST-ROLLBACK-AUDIT-INSERT-${Date.now()}`;

    console.log("\n========================================");
    console.log("TEST ROLLBACK APRÈS INSERTION AUDIT");
    console.log("========================================\n");

    // -------------------------------------------------
    // 1. ÉTAT INITIAL DU LOYER
    // -------------------------------------------------

    const rentBeforeResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            lease_id,
            tenant_id,
            due_date,
            amount,
            status,
            payment_id
        FROM marega.rents
        WHERE id = $1
          AND agency_id = $2
        `,
        [rentId, agencyId]
    );

    if (rentBeforeResult.rows.length === 0) {
        throw new Error(`Loyer ${rentId} introuvable.`);
    }

    const rentBefore = rentBeforeResult.rows[0];

    console.log("LOYER AVANT :");
    console.table([rentBefore]);

    if (
        rentBefore.status !== "Impayé" ||
        rentBefore.payment_id !== null
    ) {
        throw new Error(
            `Le loyer ${rentId} n'est pas dans l'état attendu.`
        );
    }

    // -------------------------------------------------
    // 2. COMPTABLE
    // -------------------------------------------------

    const cashierResult = await db.query(
        `
        SELECT
            p.cashier_user_id,
            u.email,
            u.first_name,
            u.last_name
        FROM marega.payments p
        JOIN marega.users u
            ON u.id = p.cashier_user_id
        WHERE p.id = 17
          AND p.agency_id = $1
        `,
        [agencyId]
    );

    if (cashierResult.rows.length === 0) {
        throw new Error("Comptable de test introuvable.");
    }

    const cashier = cashierResult.rows[0];

    console.log("\nCOMPTABLE :");
    console.table([cashier]);

    // -------------------------------------------------
    // 3. DONNÉES PAIEMENT
    // -------------------------------------------------

    const paymentData = {

        tenant_id: rentBefore.tenant_id,

        lease_id: rentBefore.lease_id,

        rent_id: rentBefore.id,

        payment_month: "2026-11-01",

        amount: Number(rentBefore.amount),

        payment_date: "2026-09-24",

        payment_method: "Virement",

        reference: testReference,

        status: "Payé",

        notes: "TEST ROLLBACK AUDIT INSERT"

    };

    const req = {

        user: {
            id: cashier.cashier_user_id,
            agency_id: agencyId
        },

        body: paymentData,

        ip: "127.0.0.1",

        get(name) {

            if (name === "user-agent") {
                return "TEST-ROLLBACK-AUDIT-INSERT";
            }

            return null;

        }

    };

    const res = {

        statusCode: 200,
        body: null,

        status(code) {
            this.statusCode = code;
            return this;
        },

        json(data) {
            this.body = data;
            return this;
        }

    };

    // -------------------------------------------------
    // 4. REMPLACER TEMPORAIREMENT AuditLog.create()
    // -------------------------------------------------
    // On laisse l'insertion réelle se produire,
    // puis on provoque une erreur.
    // -------------------------------------------------

    const originalAuditCreate =
        AuditLog.create;

    let insertedAuditId = null;

    AuditLog.create = async function(data, client) {

        const audit =
            await originalAuditCreate.call(
                AuditLog,
                data,
                client
            );

        insertedAuditId = audit.id;

        console.log(
            `\n✅ AUDIT RÉELLEMENT INSÉRÉ : ${audit.id}`
        );

        throw new Error(
            "TEST : erreur volontaire APRÈS insertion de l'audit"
        );

    };

    try {

        await PaymentsController.create(
            req,
            res
        );

    }

    finally {

        // Restaurer immédiatement la vraie méthode
        AuditLog.create =
            originalAuditCreate;

    }

    console.log("\nRÉPONSE CONTROLLER :");
    console.log("HTTP :", res.statusCode);

    console.log(
        "BODY :",
        JSON.stringify(
            res.body,
            null,
            2
        )
    );

    // -------------------------------------------------
    // 5. LE PAIEMENT NE DOIT PAS EXISTER
    // -------------------------------------------------

    const paymentResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            tenant_id,
            lease_id,
            reference,
            status,
            receipt_path
        FROM marega.payments
        WHERE agency_id = $1
          AND reference = $2
        `,
        [agencyId, testReference]
    );

    console.log("\nPAIEMENT APRÈS ROLLBACK :");
    console.table(paymentResult.rows);

    if (paymentResult.rows.length !== 0) {

        throw new Error(
            "❌ Le paiement existe encore après le rollback."
        );

    }

    // -------------------------------------------------
    // 6. LE LOYER DOIT ÊTRE RESTAURÉ
    // -------------------------------------------------

    const rentAfterResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            lease_id,
            tenant_id,
            due_date,
            amount,
            status,
            payment_id
        FROM marega.rents
        WHERE id = $1
          AND agency_id = $2
        `,
        [rentId, agencyId]
    );

    const rentAfter = rentAfterResult.rows[0];

    console.log("\nLOYER APRÈS ROLLBACK :");
    console.table([rentAfter]);

    if (
        rentAfter.status !== rentBefore.status ||
        rentAfter.payment_id !== rentBefore.payment_id
    ) {

        throw new Error(
            "❌ Le loyer n'est pas revenu à son état initial."
        );

    }

    // -------------------------------------------------
    // 7. L'AUDIT QUI AVAIT ÉTÉ INSERTÉ
    //    DOIT AVOIR DISPARU
    // -------------------------------------------------

    const auditByIdResult = await db.query(
        `
        SELECT
            id,
            user_id,
            agency_id,
            action,
            module,
            entity_id,
            details,
            created_at
        FROM marega.audit_logs
        WHERE id = $1
        `,
        [insertedAuditId]
    );

    console.log("\nAUDIT APRÈS ROLLBACK :");
    console.table(auditByIdResult.rows);

    if (auditByIdResult.rows.length !== 0) {

        throw new Error(
            "❌ L'audit existe encore après le rollback."
        );

    }

    // -------------------------------------------------
    // 8. VÉRIFIER QU'AUCUN AUDIT DU TEST NE RESTE
    // -------------------------------------------------

    const auditByReferenceResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            action,
            module,
            entity_id
        FROM marega.audit_logs
        WHERE agency_id = $1
          AND module = 'payments'
          AND action = 'CREATE'
          AND details->>'reference' = $2
        `,
        [agencyId, testReference]
    );

    console.log(
        "\nAUDITS RESTANTS POUR LA RÉFÉRENCE DE TEST :"
    );

    console.table(
        auditByReferenceResult.rows
    );

    if (
        auditByReferenceResult.rows.length !== 0
    ) {

        throw new Error(
            "❌ Un audit de test est toujours présent."
        );

    }

    // -------------------------------------------------
    // 9. VÉRIFIER LE PDF DU PAIEMENT TEMPORAIRE
    // -------------------------------------------------
    //
    // L'ID du paiement ne peut pas être récupéré
    // depuis payments après rollback.
    //
    // Le nom suivant correspond au prochain ID
    // utilisé pendant la transaction.
    //
    // On recherche les fichiers générés récemment
    // et on affiche les RECU concernés.
    // -------------------------------------------------

    const receiptsFolder =
        path.join(
            __dirname,
            "receipts"
        );

    const files =
        fs.readdirSync(receiptsFolder)
            .filter(file =>
                /^RECU-\d+\.pdf$/i.test(file)
            );

    console.log(
        "\nNombre de reçus présents :",
        files.length
    );

    // -------------------------------------------------
    // 10. RÉSULTAT
    // -------------------------------------------------

    console.log("\n========================================");
    console.log("✅ TEST ROLLBACK AUDIT INSERT RÉUSSI");
    console.log("========================================\n");

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
        }, 500);

    });
