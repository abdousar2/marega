const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");
const AuditLog = require("./src/models/audit.model");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function dateOnly(value) {

    return new Date(value)
        .toISOString()
        .slice(0, 10);

}

function sha256(filePath) {

    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(filePath))
        .digest("hex");

}

function buildRequest(
    userId,
    agencyId,
    paymentId,
    body,
    userAgent
) {

    return {

        params: {
            id: String(paymentId)
        },

        user: {
            id: userId,
            agency_id: agencyId
        },

        body,

        ip: "127.0.0.1",

        get(name) {

            if (name === "user-agent") {
                return userAgent;
            }

            return null;

        }

    };

}

function buildResponse() {

    return {

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

}

async function run() {

    const agencyId = 6;
    const paymentId = 17;
    const userId = 13;

    console.log("\n========================================");
    console.log("TEST PAYMENT.UPDATE()");
    console.log("========================================\n");

    // =========================================================
    // 1. ÉTAT INITIAL
    // =========================================================

    const initialResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            tenant_id,
            lease_id,
            payment_month,
            amount,
            payment_date,
            payment_method,
            reference,
            status,
            notes,
            receipt_path,
            cashier_user_id
        FROM marega.payments
        WHERE id = $1
          AND agency_id = $2
        `,
        [paymentId, agencyId]
    );

    if (initialResult.rows.length === 0) {
        throw new Error(
            `Paiement ${paymentId} introuvable dans l'agence ${agencyId}.`
        );
    }

    const initialPayment =
        initialResult.rows[0];

    console.log("PAIEMENT INITIAL :");
    console.table([initialPayment]);

    if (initialPayment.status !== "Payé") {

        throw new Error(
            "Le test attend un paiement déjà encaissé."
        );

    }

    if (!initialPayment.receipt_path) {

        throw new Error(
            "Le paiement de test ne possède pas de receipt_path."
        );

    }

    // =========================================================
    // 2. FICHIER PDF INITIAL
    // =========================================================

    const receiptFilename =
        path.basename(
            initialPayment.receipt_path
        );

    const receiptPath =
        path.join(
            __dirname,
            "receipts",
            receiptFilename
        );

    if (!fs.existsSync(receiptPath)) {

        throw new Error(
            `Le reçu ${receiptFilename} n'existe pas.`
        );

    }

    const initialHash =
        sha256(receiptPath);

    console.log("\nPDF INITIAL :");
    console.log("Fichier :", receiptPath);
    console.log("SHA-256 :", initialHash);

    // =========================================================
    // 3. TEST NOMINAL UPDATE
    // =========================================================

    console.log("\n========================================");
    console.log("1) TEST UPDATE NOMINAL");
    console.log("========================================\n");

    const nominalReference =
        `TEST-UPDATE-NOMINAL-${Date.now()}`;

    const nominalNotes =
        "TEST UPDATE NOMINAL PAYMENT";

    const nominalDate =
        "2026-09-25";

    const nominalBody = {

        payment_date:
            nominalDate,

        reference:
            nominalReference,

        notes:
            nominalNotes

    };

    const nominalReq =
    buildRequest(
        userId,
        agencyId,
        paymentId,
        nominalBody,
        "TEST-UPDATE-NOMINAL"
    );

    const nominalRes =
        buildResponse();

    await PaymentsController.update(
        nominalReq,
        nominalRes
    );

    console.log(
        "HTTP nominal :",
        nominalRes.statusCode
    );

    if (nominalRes.body) {

        console.log(
            JSON.stringify(
                nominalRes.body,
                null,
                2
            )
        );

    }

    if (nominalRes.statusCode !== 200) {

        throw new Error(
            `L'update nominal a échoué : HTTP ${nominalRes.statusCode}`
        );

    }

    // =========================================================
    // 4. VÉRIFIER LES DONNÉES APRÈS UPDATE
    // =========================================================

    const nominalDbResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            payment_date,
            payment_method,
            reference,
            status,
            notes,
            receipt_path
        FROM marega.payments
        WHERE id = $1
          AND agency_id = $2
        `,
        [paymentId, agencyId]
    );

    const nominalPayment =
        nominalDbResult.rows[0];

    console.log("\nPAIEMENT APRÈS UPDATE NOMINAL :");
    console.table([nominalPayment]);

    if (
        dateOnly(nominalPayment.payment_date) !== nominalDate ||
        nominalPayment.reference !== nominalReference ||
        nominalPayment.notes !== nominalNotes ||
        nominalPayment.status !== "Payé"
    ) {

        throw new Error(
            "Les données du paiement n'ont pas été correctement modifiées."
        );

    }

    // =========================================================
    // 5. VÉRIFIER LE PDF APRÈS UPDATE
    // =========================================================

    if (!fs.existsSync(receiptPath)) {

        throw new Error(
            "Le nouveau PDF n'existe pas."
        );

    }

    const nominalHash =
        sha256(receiptPath);

    console.log("\nPDF APRÈS UPDATE NOMINAL :");
    console.log(
        "SHA-256 :",
        nominalHash
    );

    if (nominalHash === initialHash) {

        throw new Error(
            "Le PDF n'a pas changé alors que la date de paiement a été modifiée."
        );

    }

    console.log(
        "✅ Le PDF a bien été régénéré."
    );

    // =========================================================
    // 6. VÉRIFIER L'AUDIT NOMINAL
    // =========================================================

    const nominalAuditResult = await db.query(
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
        WHERE agency_id = $1
          AND module = 'payments'
          AND action = 'UPDATE'
          AND entity_id = $2
        ORDER BY id DESC
        LIMIT 1
        `,
        [agencyId, paymentId]
    );

    console.log("\nAUDIT APRÈS UPDATE NOMINAL :");
    console.table(
        nominalAuditResult.rows
    );

    if (
        nominalAuditResult.rows.length === 0
    ) {

        throw new Error(
            "Aucun audit UPDATE trouvé après l'update nominal."
        );

    }

    // =========================================================
    // 7. PRÉPARER LE TEST ROLLBACK
    // =========================================================

    console.log("\n========================================");
    console.log("2) TEST UPDATE + ROLLBACK");
    console.log("========================================\n");

    const beforeRollbackPayment =
        nominalPayment;

    const beforeRollbackHash =
        nominalHash;

    const rollbackReference =
        `TEST-UPDATE-ROLLBACK-${Date.now()}`;

    const rollbackNotes =
        "TEST UPDATE ROLLBACK";

    const rollbackDate =
        "2026-09-26";

    const rollbackBody = {

        payment_date:
            rollbackDate,

        reference:
            rollbackReference,

        notes:
            rollbackNotes

    };

    const rollbackReq =
    buildRequest(
        userId,
        agencyId,
        paymentId,
        rollbackBody,
        "TEST-UPDATE-ROLLBACK"
    );

    const rollbackRes =
        buildResponse();

    // =========================================================
    // 8. FORCER L'ERREUR APRÈS INSERTION RÉELLE DE L'AUDIT
    // =========================================================

    const originalAuditCreate =
        AuditLog.create;

    let insertedAuditId =
        null;

    AuditLog.create =
        async function(
            data,
            client
        ) {

            const audit =
                await originalAuditCreate.call(
                    AuditLog,
                    data,
                    client
                );

            insertedAuditId =
                audit.id;

            console.log(
                `\n✅ AUDIT RÉELLEMENT INSÉRÉ : ${audit.id}`
            );

            throw new Error(
                "TEST : erreur volontaire APRÈS insertion audit UPDATE"
            );

        };

    try {

        await PaymentsController.update(
            rollbackReq,
            rollbackRes
        );

    }

    finally {

        AuditLog.create =
            originalAuditCreate;

    }

    console.log(
        "\nHTTP rollback :",
        rollbackRes.statusCode
    );

    console.log(
        "BODY rollback :",
        JSON.stringify(
            rollbackRes.body,
            null,
            2
        )
    );

    if (rollbackRes.statusCode !== 500) {

        throw new Error(
            `Le test rollback devait retourner HTTP 500, reçu ${rollbackRes.statusCode}.`
        );

    }

    // =========================================================
    // 9. VÉRIFIER LE PAIEMENT RESTAURÉ
    // =========================================================

    const afterRollbackResult = await db.query(
        `
        SELECT
            id,
            agency_id,
            payment_date,
            payment_method,
            reference,
            status,
            notes,
            receipt_path
        FROM marega.payments
        WHERE id = $1
          AND agency_id = $2
        `,
        [paymentId, agencyId]
    );

    const afterRollbackPayment =
        afterRollbackResult.rows[0];

    console.log("\nPAIEMENT APRÈS ROLLBACK :");
    console.table([
        afterRollbackPayment
    ]);

    if (
        dateOnly(afterRollbackPayment.payment_date) !==
            dateOnly(beforeRollbackPayment.payment_date) ||

        afterRollbackPayment.reference !==
            beforeRollbackPayment.reference ||

        afterRollbackPayment.notes !==
            beforeRollbackPayment.notes ||

        afterRollbackPayment.receipt_path !==
            beforeRollbackPayment.receipt_path ||

        afterRollbackPayment.status !==
            beforeRollbackPayment.status
    ) {

        throw new Error(
            "❌ Le paiement n'a pas été restauré à son état initial du test rollback."
        );

    }

    console.log(
        "✅ Données du paiement restaurées."
    );

    // =========================================================
    // 10. VÉRIFIER LE PDF RESTAURÉ
    // =========================================================

    if (!fs.existsSync(receiptPath)) {

        throw new Error(
            "❌ Le PDF n'existe plus après rollback."
        );

    }

    const restoredHash =
        sha256(receiptPath);

    console.log("\nPDF APRÈS ROLLBACK :");
    console.log(
        "SHA-256 attendu :",
        beforeRollbackHash
    );

    console.log(
        "SHA-256 obtenu  :",
        restoredHash
    );

    if (
        restoredHash !==
        beforeRollbackHash
    ) {

        throw new Error(
            "❌ Le contenu de l'ancien PDF n'a pas été restauré."
        );

    }

    console.log(
        "✅ Ancien PDF restauré à l'identique."
    );

    // =========================================================
    // 11. VÉRIFIER L'AUDIT RÉELLEMENT INSÉRÉ
    // =========================================================

    const rolledBackAudit =
        await db.query(
            `
            SELECT
                id,
                user_id,
                agency_id,
                action,
                module,
                entity_id,
                created_at
            FROM marega.audit_logs
            WHERE id = $1
            `,
            [insertedAuditId]
        );

    console.log(
        "\nAUDIT APRÈS ROLLBACK :"
    );

    console.table(
        rolledBackAudit.rows
    );

    if (
        rolledBackAudit.rows.length !== 0
    ) {

        throw new Error(
            "❌ L'audit UPDATE existe encore après rollback."
        );

    }

    // =========================================================
    // 12. VÉRIFIER QU'AUCUN AUDIT DE ROLLBACK NE RESTE
    // =========================================================

    const rollbackAuditByReference =
        await db.query(
            `
            SELECT
                id,
                action,
                module,
                entity_id,
                details
            FROM marega.audit_logs
            WHERE agency_id = $1
              AND module = 'payments'
              AND action = 'UPDATE'
              AND details->'after'->>'reference' = $2
            `,
            [agencyId, rollbackReference]
        );

    console.log(
        "\nAUDITS ROLLBACK RESTANTS :"
    );

    console.table(
        rollbackAuditByReference.rows
    );

    if (
        rollbackAuditByReference.rows.length !== 0
    ) {

        throw new Error(
            "❌ Un audit du test rollback est toujours présent."
        );

    }

    // =========================================================
    // 13. RÉSULTAT
    // =========================================================

    console.log("\n========================================");
    console.log("✅ TEST PAYMENT.UPDATE() RÉUSSI");
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
