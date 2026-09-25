const db = require("./src/config/database");
const PaymentsController = require("./src/controllers/payments.controller");

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
    console.log("TEST CHAMPS PROTÉGÉS PAYMENT.UPDATE()");
    console.log("========================================\n");

    // -------------------------------------------------
    // ÉTAT INITIAL
    // -------------------------------------------------

    const beforeResult = await db.query(
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
            receipt_path
        FROM marega.payments
        WHERE id = $1
          AND agency_id = $2
        `,
        [paymentId, agencyId]
    );

    if (beforeResult.rows.length === 0) {

        throw new Error(
            "Paiement de test introuvable."
        );

    }

    const before =
        beforeResult.rows[0];

    console.log(
        "PAIEMENT AVANT :"
    );

    console.table([before]);

    // -------------------------------------------------
    // TENTATIVE DE MODIFICATION DES CHAMPS PROTÉGÉS
    // -------------------------------------------------

    const req = {

        params: {
            id: String(paymentId)
        },

        user: {
            id: userId,
            agency_id: agencyId
        },

        body: {

            tenant_id:
                before.tenant_id + 999,

            lease_id:
                before.lease_id + 999,

            payment_month:
                "2030-01-01",

            amount:
                "999999.00",

            status:
                "Impayé",

            payment_date:
                "2026-09-28",

            payment_method:
                "Espèces",

            reference:
                `TEST-PROTECTED-${Date.now()}`,

            notes:
                "TENTATIVE CHAMPS PROTÉGÉS"

        },

        ip: "127.0.0.1",

        get(name) {

            if (name === "user-agent") {

                return "TEST-PROTECTED-FIELDS";

            }

            return null;

        }

    };

    const res =
        buildResponse();

    await PaymentsController.update(
        req,
        res
    );

    console.log(
        "\nRÉPONSE :"
    );

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

    if (res.statusCode !== 409) {

        throw new Error(
            `La tentative protégée devait retourner HTTP 409, reçu ${res.statusCode}.`
        );

    }

    // -------------------------------------------------
    // VÉRIFIER QUE RIEN N'A CHANGÉ
    // -------------------------------------------------

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
            receipt_path
        FROM marega.payments
        WHERE id = $1
          AND agency_id = $2
        `,
        [paymentId, agencyId]
    );

    const after =
        afterResult.rows[0];

    console.log(
        "\nPAIEMENT APRÈS TENTATIVE :"
    );

    console.table([after]);

    const unchanged =

        String(after.tenant_id) ===
            String(before.tenant_id) &&

        String(after.lease_id) ===
            String(before.lease_id) &&

        new Date(after.payment_month)
            .toISOString() ===
            new Date(before.payment_month)
                .toISOString() &&

        String(after.amount) ===
            String(before.amount) &&

        String(after.payment_date) ===
            String(before.payment_date) &&

        after.payment_method ===
            before.payment_method &&

        after.reference ===
            before.reference &&

        after.status ===
            before.status &&

        after.notes ===
            before.notes &&

        after.receipt_path ===
            before.receipt_path;

    if (!unchanged) {

        throw new Error(
            "❌ Le paiement a été modifié malgré la protection des champs."
        );

    }

    console.log(
        "✅ Aucun champ du paiement n'a été modifié."
    );

    // -------------------------------------------------
    // VÉRIFIER L'AUDIT UPDATE_ATTEMPT
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
            details,
            created_at
        FROM marega.audit_logs
        WHERE agency_id = $1
          AND module = 'payments'
          AND action = 'UPDATE_ATTEMPT'
          AND entity_id = $2
        ORDER BY id DESC
        LIMIT 1
        `,
        [agencyId, paymentId]
    );

    console.log(
        "\nDERNIER AUDIT UPDATE_ATTEMPT :"
    );

    console.table(
        auditResult.rows
    );

    if (auditResult.rows.length === 0) {

        throw new Error(
            "❌ La tentative de modification protégée n'a pas été auditée."
        );

    }

    const audit =
        auditResult.rows[0];

    console.log(
        "\nDÉTAILS DE L'AUDIT :"
    );

    console.log(
        JSON.stringify(
            audit.details,
            null,
            2
        )
    );

    if (
        !Array.isArray(
            audit.details?.protected_fields
        )
    ) {

        throw new Error(
            "❌ La liste des champs protégés n'est pas présente dans l'audit."
        );

    }

    const expectedFields = [
        "tenant_id",
        "lease_id",
        "payment_month",
        "amount",
        "status"
    ];

    for (const field of expectedFields) {

        if (
            !audit.details.protected_fields.includes(field)
        ) {

            throw new Error(
                `❌ Le champ protégé ${field} n'a pas été enregistré dans l'audit.`
            );

        }

    }

    console.log(
        "✅ Les cinq champs protégés ont été correctement audités."
    );

    console.log("\n========================================");
    console.log("✅ TEST CHAMPS PROTÉGÉS RÉUSSI");
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
