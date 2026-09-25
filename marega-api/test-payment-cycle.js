const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");
const fs = require("fs");
const path = require("path");

async function run() {

    const agencyId = 6;
    const rentId = 78;
    const testReference = `TEST-PAYMENT-CYCLE-${Date.now()}`;

    console.log("\n========================================");
    console.log("TEST PAYMENT → RENT → RECEIPT → AUDIT");
    console.log("========================================\n");

    // -------------------------------------------------
    // 1. Vérifier le loyer de test
    // -------------------------------------------------

    const rentBefore = await db.query(
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

    if (rentBefore.rows.length === 0) {
        throw new Error(`Loyer ${rentId} introuvable dans l'agence ${agencyId}.`);
    }

    const rent = rentBefore.rows[0];

    console.log("LOYER AVANT :");
    console.table([rent]);

    if (
        rent.status === "Payé" ||
        rent.payment_id !== null
    ) {
        throw new Error(
            `Le loyer ${rentId} est déjà payé. Choisir un autre loyer de test.`
        );
    }

    // -------------------------------------------------
    // 2. Récupérer un utilisateur de l'agence 6
    //    à partir du paiement de test 16
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
        WHERE p.id = 16
          AND p.agency_id = $1
        `,
        [agencyId]
    );

    if (cashierResult.rows.length === 0) {
        throw new Error(
            "Impossible de récupérer le comptable de test du paiement 16."
        );
    }

    const cashier = cashierResult.rows[0];

    console.log("\nCOMPTABLE DE TEST :");
    console.table([cashier]);

    // -------------------------------------------------
    // 3. Récupérer le montant du loyer
    // -------------------------------------------------

    const paymentData = {
        tenant_id: rent.tenant_id,
        lease_id: rent.lease_id,
        rent_id: rent.id,

        payment_month: "2026-10-01",

        amount: Number(rent.amount),

        payment_date: "2026-09-24",

        payment_method: "Virement",

        reference: testReference,

        status: "Payé",

        notes: "TEST E2E PAYMENT RENT RECEIPT AUDIT",

    };

    // -------------------------------------------------
    // 4. Construire la requête simulée
    //    mais appeler le vrai Controller
    // -------------------------------------------------

    const req = {

        user: {
            id: cashier.cashier_user_id,
            agency_id: agencyId
        },

        body: paymentData,

        ip: "127.0.0.1",

        get(name) {
            if (name === "user-agent") {
                return "TEST-E2E";
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
    // 5. APPEL DU VRAI CONTROLLER
    // -------------------------------------------------

    await PaymentsController.create(req, res);

    console.log("\nRÉPONSE CONTROLLER :");
    console.log("HTTP :", res.statusCode);

    if (res.body) {
        console.log(
            JSON.stringify(res.body, null, 2)
        );
    }

    if (res.statusCode !== 201) {
        throw new Error(
            `Création du paiement échouée avec HTTP ${res.statusCode}.`
        );
    }

    const createdPaymentId = res.body.id;

    console.log(
        `\n✅ Paiement créé : ${createdPaymentId}`
    );

    // -------------------------------------------------
    // 6. Vérifier le paiement en base
    // -------------------------------------------------

    const paymentAfter = await db.query(
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
            receipt_path,
            cashier_user_id
        FROM marega.payments
        WHERE id = $1
          AND agency_id = $2
        `,
        [createdPaymentId, agencyId]
    );

    console.log("\nPAIEMENT EN BASE :");
    console.table(paymentAfter.rows);

    // -------------------------------------------------
    // 7. Vérifier le loyer
    // -------------------------------------------------

    const rentAfter = await db.query(
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

    console.log("\nLOYER APRÈS :");
    console.table(rentAfter.rows);

    // -------------------------------------------------
    // 8. Vérifier le PDF
    // -------------------------------------------------

    const payment = paymentAfter.rows[0];

    if (!payment.receipt_path) {
        throw new Error(
            "Le payment existe mais receipt_path est vide."
        );
    }

    const receiptFilename =
        path.basename(payment.receipt_path);

    const receiptPhysicalPath =
        path.join(
            __dirname,
            "receipts",
            receiptFilename
        );

    const receiptExists =
        fs.existsSync(receiptPhysicalPath);

    console.log("\nREÇU :");
    console.log(
        "Chemin DB      :",
        payment.receipt_path
    );

    console.log(
        "Chemin physique:",
        receiptPhysicalPath
    );

    console.log(
        "PDF existe     :",
        receiptExists
    );

    if (!receiptExists) {
        throw new Error(
            "Le chemin du reçu est enregistré mais le fichier PDF n'existe pas."
        );
    }

    // -------------------------------------------------
    // 9. Vérifier l'AUDIT
    // -------------------------------------------------

    const auditResult = await db.query(
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
        WHERE agency_id = $1
          AND module = 'payments'
          AND action = 'CREATE'
          AND entity_id = $2
        ORDER BY id DESC
        LIMIT 1
        `,
        [agencyId, createdPaymentId]
    );

    console.log("\nAUDIT :");
    console.table(auditResult.rows);

    if (auditResult.rows.length === 0) {
        throw new Error(
            "Aucun audit CREATE trouvé pour le paiement."
        );
    }

    // -------------------------------------------------
    // 10. TEST DOUBLE PAIEMENT
    // -------------------------------------------------

    console.log(
        "\n========================================"
    );

    console.log(
        "TEST DOUBLE PAIEMENT"
    );

    console.log(
        "========================================"
    );

    const reqDuplicate = {

        user: {
            id: cashier.cashier_user_id,
            agency_id: agencyId
        },

        body: {
            ...paymentData,
            reference: `${testReference}-DUPLICATE`
        },

        ip: "127.0.0.1",

        get(name) {
            if (name === "user-agent") {
                return "TEST-E2E-DUPLICATE";
            }

            return null;
        }

    };

    const resDuplicate = {

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

    await PaymentsController.create(
        reqDuplicate,
        resDuplicate
    );

    console.log(
        "HTTP doublon :",
        resDuplicate.statusCode
    );

    console.log(
        "Réponse doublon :",
        JSON.stringify(
            resDuplicate.body,
            null,
            2
        )
    );

    if (resDuplicate.statusCode !== 409) {
        throw new Error(
            `Le double paiement aurait dû être refusé en 409, reçu : ${resDuplicate.statusCode}`
        );
    }

    // -------------------------------------------------
    // 11. Vérifier qu'il n'existe qu'un seul paiement
    // -------------------------------------------------

    const paymentCount = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM marega.payments
        WHERE agency_id = $1
          AND lease_id = $2
          AND reference = $3
        `,
        [
            agencyId,
            rent.lease_id,
            testReference
        ]
    );

    console.log(
        "\nNombre de paiements avec la référence de test :",
        paymentCount.rows[0].count
    );

    if (paymentCount.rows[0].count !== 1) {
        throw new Error(
            "Le contrôle anti-double-paiement n'est pas cohérent."
        );
    }

    console.log("\n========================================");
    console.log("✅ TEST COMPLET RÉUSSI");
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

    .finally(async () => {

        setTimeout(() => {
            process.exit();
        }, 500);

    });
