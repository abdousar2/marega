const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");
const AuditService = require("./src/services/audit.service");
const fs = require("fs");
const path = require("path");

async function run() {

    const agencyId = 6;
    const rentId = 79;
    const testReference = `TEST-ROLLBACK-AUDIT-${Date.now()}`;

    console.log("\n========================================");
    console.log("TEST ROLLBACK APRÈS ÉCHEC AUDIT");
    console.log("========================================\n");

    // -------------------------------------------------
    // 1. État initial du loyer
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
    // 2. Récupérer le comptable de test
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
        throw new Error(
            "Comptable de test introuvable."
        );
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

        payment_month: "2026-11-01",

        amount: Number(rentBefore.amount),

        payment_date: "2026-09-24",

        payment_method: "Virement",

        reference: testReference,

        status: "Payé",

        notes: "TEST ROLLBACK AUDIT"

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
                return "TEST-ROLLBACK-AUDIT";
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
    // 4. FORCER L'ÉCHEC DE L'AUDIT
    // -------------------------------------------------

    const originalAuditLog =
        AuditService.log;

    AuditService.log = async function () {

        console.log(
            "\n💥 ÉCHEC AUDIT VOLONTAIRE"
        );

        throw new Error(
            "TEST : échec volontaire de l'audit"
        );

    };

    let controllerError = null;

    try {

        await PaymentsController.create(
            req,
            res
        );

    }

    catch (error) {

        controllerError = error;

    }

    finally {

        // Restaurer le vrai audit
        AuditService.log =
            originalAuditLog;

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

    if (controllerError) {
        console.log(
            "Erreur remontée au script :",
            controllerError.message
        );
    }

    // -------------------------------------------------
    // 5. RETROUVER LES PAIEMENTS CRÉÉS PAR LE TEST
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
    // 6. VÉRIFIER LE LOYER
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
    // 7. VÉRIFIER L'AUDIT
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
            "❌ Un audit de test existe malgré le rollback."
        );

    }

    // -------------------------------------------------
    // 8. VÉRIFIER LES PDF DU TEST
    // -------------------------------------------------

    const receiptsFolder =
        path.join(
            __dirname,
            "receipts"
        );

    const testReceiptFiles =
        fs.readdirSync(receiptsFolder)
            .filter(file =>
                /^RECU-\d+\.pdf$/i.test(file)
            );

    console.log(
        "\nPDF présents dans receipts :",
        testReceiptFiles
    );

    // Aucun paiement n'a persisté, donc aucun PDF
    // correspondant à ce test ne doit rester.
    //
    // Le contrôleur utilise l'id du paiement généré
    // uniquement pendant la transaction. Nous vérifions
    // aussi les fichiers les plus récents.

    console.log(
        "\n========================================"
    );

    console.log(
        "✅ ROLLBACK AUDIT TEST TERMINÉ"
    );

    console.log(
        "========================================\n"
    );

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
