const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");
const ReceiptService = require("./src/services/receipt.service");
const fs = require("fs");
const path = require("path");

async function run() {

    const agencyId = 6;
    const rentId = 80;
    const testReference = `TEST-ROLLBACK-RECEIPT-${Date.now()}`;

    console.log("\n========================================");
    console.log("TEST ROLLBACK APRÈS ÉCHEC DU REÇU");
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
            `Le loyer ${rentId} n'est pas dans l'état de test attendu.`
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
    // 3. DONNÉES DU PAIEMENT
    // -------------------------------------------------

    const paymentData = {

        tenant_id: rentBefore.tenant_id,

        lease_id: rentBefore.lease_id,

        rent_id: rentBefore.id,

        payment_month: "2026-12-01",

        amount: Number(rentBefore.amount),

        payment_date: "2026-09-24",

        payment_method: "Virement",

        reference: testReference,

        status: "Payé",

        notes: "TEST ROLLBACK RECEIPT"

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
                return "TEST-ROLLBACK-RECEIPT";
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
    // 4. SIMULER UNE PANNE DU RECEIPT SERVICE
    // -------------------------------------------------
    //
    // Le vrai PDF est d'abord généré.
    // Ensuite seulement, nous lançons une erreur.
    //
    // Cela permet de vérifier que le contrôleur
    // supprime bien le PDF lors du rollback.
    // -------------------------------------------------

    const originalGenerateReceipt =
        ReceiptService.generateReceipt;

    ReceiptService.generateReceipt =
        async function(payment) {

            const receiptPath =
                await originalGenerateReceipt.call(
                    ReceiptService,
                    payment
                );

            console.log(
                `\n✅ PDF réellement généré : ${receiptPath}`
            );

            throw new Error(
                "TEST : erreur volontaire APRÈS génération du reçu"
            );

        };

    try {

        await PaymentsController.create(
            req,
            res
        );

    }

    finally {

        // Restaurer immédiatement le vrai service
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

    // -------------------------------------------------
    // 5. LE PAIEMENT DOIT AVOIR DISPARU
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
    // 7. AUCUN AUDIT NE DOIT RESTER
    // -------------------------------------------------

    const auditResult = await db.query(
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

    console.log("\nAUDIT APRÈS ROLLBACK :");
    console.table(auditResult.rows);

    if (auditResult.rows.length !== 0) {

        throw new Error(
            "❌ Un audit existe encore après le rollback."
        );

    }

    // -------------------------------------------------
    // 8. LE PDF TEMPORAIRE DOIT AVOIR DISPARU
    // -------------------------------------------------
    //
    // Le paiement suivant devrait utiliser l'ID 20.
    // Nous vérifions explicitement RECU-20.pdf.
    // -------------------------------------------------

    const expectedReceipt =
        path.join(
            __dirname,
            "receipts",
            "RECU-20.pdf"
        );

    const receiptExists =
        fs.existsSync(expectedReceipt);

    console.log("\nPDF DE TEST :");
    console.log(
        "Chemin :",
        expectedReceipt
    );

    console.log(
        "Existe encore :",
        receiptExists
    );

    if (receiptExists) {

        throw new Error(
            "❌ Le PDF RECU-20.pdf existe encore après rollback."
        );

    }

    // -------------------------------------------------
    // 9. RÉSULTAT
    // -------------------------------------------------

    console.log("\n========================================");
    console.log("✅ TEST ROLLBACK RECEIPT RÉUSSI");
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
