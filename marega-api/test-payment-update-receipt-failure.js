const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");
const ReceiptService = require("./src/services/receipt.service");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256(filePath) {

    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(filePath))
        .digest("hex");

}

function dateOnly(value) {

    return new Date(value)
        .toISOString()
        .slice(0, 10);

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
    console.log("TEST UPDATE : ÉCHEC DU REÇU");
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
            `Paiement ${paymentId} introuvable.`
        );

    }

    const initialPayment =
        initialResult.rows[0];

    console.log("PAIEMENT AVANT :");
    console.table([initialPayment]);

    if (!initialPayment.receipt_path) {

        throw new Error(
            "Le paiement ne possède pas de receipt_path."
        );

    }

    const receiptFilename =
        path.basename(
            initialPayment.receipt_path
        );

    const receiptPhysicalPath =
        path.join(
            __dirname,
            "receipts",
            receiptFilename
        );

    if (!fs.existsSync(receiptPhysicalPath)) {

        throw new Error(
            `Le fichier ${receiptFilename} n'existe pas.`
        );

    }

    const initialHash =
        sha256(receiptPhysicalPath);

    console.log("\nPDF AVANT :");
    console.log(
        "Fichier :",
        receiptPhysicalPath
    );
    console.log(
        "SHA-256 :",
        initialHash
    );

    // =========================================================
    // 2. PRÉPARER L'UPDATE TEMPORAIRE
    // =========================================================

    const rollbackDate =
        "2026-09-27";

    const rollbackReference =
        `TEST-RECEIPT-FAIL-${Date.now()}`;

    const rollbackNotes =
        "TEST UPDATE RECEIPT FAILURE";

    const req =
        buildRequest(

            userId,
            agencyId,
            paymentId,

            {
                payment_date:
                    rollbackDate,

                reference:
                    rollbackReference,

                notes:
                    rollbackNotes

            },

            "TEST-UPDATE-RECEIPT-FAILURE"

        );

    const res =
        buildResponse();

    // =========================================================
    // 3. SIMULER UNE PANNE DU RECEIPT SERVICE
    // =========================================================

    const originalGenerateReceipt =
        ReceiptService.generateReceipt;

    let generatedReceiptPath =
        null;

    ReceiptService.generateReceipt =
        async function(payment) {

            generatedReceiptPath =
                await originalGenerateReceipt.call(
                    ReceiptService,
                    payment
                );

            console.log(
                `\n✅ NOUVEAU PDF GÉNÉRÉ : ${generatedReceiptPath}`
            );

            throw new Error(
                "TEST : échec volontaire après génération du nouveau reçu"
            );

        };

    try {

        await PaymentsController.update(
            req,
            res
        );

    }

    finally {

        ReceiptService.generateReceipt =
            originalGenerateReceipt;

    }

    console.log("\nRÉPONSE CONTROLLER :");
    console.log(
        "HTTP :",
        res.statusCode
    );

    console.log(
        "BODY :",
        JSON.stringify(
            res.body,
            null,
            2
        )
    );

    if (res.statusCode !== 500) {

        throw new Error(
            `Le test devait retourner HTTP 500, reçu ${res.statusCode}.`
        );

    }

    // =========================================================
    // 4. VÉRIFIER LES DONNÉES DU PAIEMENT
    // =========================================================

    const afterResult = await db.query(
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

    const afterPayment =
        afterResult.rows[0];

    console.log(
        "\nPAIEMENT APRÈS ROLLBACK :"
    );

    console.table([afterPayment]);

    if (
        dateOnly(afterPayment.payment_date) !==
            dateOnly(initialPayment.payment_date) ||

        afterPayment.reference !==
            initialPayment.reference ||

        afterPayment.notes !==
            initialPayment.notes ||

        afterPayment.receipt_path !==
            initialPayment.receipt_path ||

        afterPayment.status !==
            initialPayment.status ||

        afterPayment.amount !==
            initialPayment.amount ||

        afterPayment.tenant_id !==
            initialPayment.tenant_id ||

        afterPayment.lease_id !==
            initialPayment.lease_id
    ) {

        throw new Error(
            "❌ Le paiement n'est pas revenu exactement à son état initial."
        );

    }

    console.log(
        "✅ Paiement entièrement restauré."
    );

    // =========================================================
    // 5. VÉRIFIER LE PDF
    // =========================================================

    if (!fs.existsSync(receiptPhysicalPath)) {

        throw new Error(
            "❌ L'ancien PDF n'existe plus."
        );

    }

    const restoredHash =
        sha256(receiptPhysicalPath);

    console.log("\nPDF APRÈS ROLLBACK :");
    console.log(
        "SHA-256 attendu :",
        initialHash
    );
    console.log(
        "SHA-256 obtenu  :",
        restoredHash
    );

    if (restoredHash !== initialHash) {

        throw new Error(
            "❌ L'ancien PDF n'a pas été restauré à l'identique."
        );

    }

    console.log(
        "✅ Ancien PDF restauré à l'identique."
    );

    // =========================================================
    // 6. VÉRIFIER QU'UN AUDIT DE CE TEST N'EXISTE PAS
    // =========================================================

    const auditResult = await db.query(
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
          AND entity_id = $2
          AND details->'after'->>'reference' = $3
        `,
        [
            agencyId,
            paymentId,
            rollbackReference
        ]
    );

    console.log(
        "\nAUDIT DU TEST APRÈS ROLLBACK :"
    );

    console.table(
        auditResult.rows
    );

    if (auditResult.rows.length !== 0) {

        throw new Error(
            "❌ Un audit de l'update annulé existe encore."
        );

    }

    // =========================================================
    // 7. VÉRIFIER LE PDF GÉNÉRÉ TEMPORAIREMENT
    // =========================================================

    if (generatedReceiptPath) {

        const generatedFilename =
            path.basename(
                generatedReceiptPath
            );

        const generatedPhysicalPath =
            path.join(
                __dirname,
                "receipts",
                generatedFilename
            );

        console.log(
            "\nPDF TEMPORAIRE :",
            generatedPhysicalPath
        );

        console.log(
            "Existe encore :",
            fs.existsSync(
                generatedPhysicalPath
            )
        );

        if (
            fs.existsSync(
                generatedPhysicalPath
            )
        ) {

            throw new Error(
                "❌ Le PDF temporaire existe encore après rollback."
            );

        }

    }

    console.log("\n========================================");
    console.log("✅ TEST UPDATE ÉCHEC REÇU RÉUSSI");
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
