const db = require("./src/config/database");

const Payment = require("./src/models/payments.model");
const PaymentsController = require("./src/controllers/payments.controller");
const AuditLog = require("./src/models/audit.model");

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

function buildReq(
    userId,
    agencyId,
    body = {},
    paymentId = null,
    userAgent = "TEST-PAYMENT-ISOLATION"
) {

    return {

        params:
            paymentId !== null
                ? { id: String(paymentId) }
                : {},

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

async function run() {

    const agencyA = 1;
    const agencyB = 6;
    const paymentId = 17;

    console.log("\n========================================");
    console.log("TEST ISOLATION MULTI-AGENCES — PAYMENTS");
    console.log("========================================\n");

    // =========================================================
    // 1. RÉCUPÉRER UN UTILISATEUR DE L'AGENCE 1
    // =========================================================

    const agency1UserResult = await db.query(
        `
        SELECT
            au.user_id,
            au.agency_id,
            au.role,
            u.email
        FROM marega.agency_users au
        JOIN marega.users u
            ON u.id = au.user_id
        WHERE au.agency_id = $1
        ORDER BY au.user_id
        LIMIT 1
        `,
        [agencyA]
    );

    if (agency1UserResult.rows.length === 0) {

        throw new Error(
            "Aucun utilisateur trouvé pour l'agence 1."
        );

    }

    const agency1User =
        agency1UserResult.rows[0];

    console.log("UTILISATEUR AGENCE 1 :");
    console.table([agency1User]);

    // =========================================================
    // 2. VÉRIFIER QUE LE PAIEMENT 17 APPARTIENT À L'AGENCE 6
    // =========================================================

    const paymentResult = await db.query(
    `
    SELECT
        id,
        agency_id,
        tenant_id,
        lease_id,
        amount,
        payment_date,
        payment_method,
        status,
        reference,
        notes,
        receipt_path
    FROM marega.payments
    WHERE id = $1
    `,
    [paymentId]
);
    if (paymentResult.rows.length === 0) {

        throw new Error(
            `Le paiement ${paymentId} n'existe pas.`
        );

    }

    const payment =
        paymentResult.rows[0];

    console.log("\nPAIEMENT CIBLE :");
    console.table([payment]);

    if (Number(payment.agency_id) !== agencyB) {

        throw new Error(
            `Le paiement ${paymentId} n'appartient pas à l'agence ${agencyB}.`
        );

    }

    // =========================================================
    // 3. AGENCE 1 → GET PAYMENT 17
    // =========================================================

    console.log("\n========================================");
    console.log("1) AGENCE 1 → LIRE PAYMENT 17");
    console.log("========================================\n");

    const reqGetForeign =
        buildReq(
            agency1User.user_id,
            agencyA,
            {},
            paymentId,
            "TEST-CROSS-AGENCY-GET"
        );

    const resGetForeign =
        buildResponse();

    await PaymentsController.getById(
        reqGetForeign,
        resGetForeign
    );

    console.log(
        "HTTP :",
        resGetForeign.statusCode
    );

    console.log(
        "BODY :",
        JSON.stringify(
            resGetForeign.body,
            null,
            2
        )
    );

    if (resGetForeign.statusCode !== 404) {

        throw new Error(
            `❌ L'agence 1 ne devait pas pouvoir lire le paiement 17. HTTP reçu : ${resGetForeign.statusCode}`
        );

    }

    console.log(
        "✅ Accès lecture inter-agence refusé."
    );

    // =========================================================
    // 4. AGENCE 1 → UPDATE PAYMENT 17
    // =========================================================

    console.log("\n========================================");
    console.log("2) AGENCE 1 → MODIFIER PAYMENT 17");
    console.log("========================================\n");

    const reqUpdateForeign =
        buildReq(
            agency1User.user_id,
            agencyA,

            {
                payment_date:
                    "2030-01-01",

                reference:
                    `TEST-CROSS-AGENCY-${Date.now()}`,

                notes:
                    "TENTATIVE AGENCE 1 SUR PAIEMENT AGENCE 6"

            },

            paymentId,

            "TEST-CROSS-AGENCY-UPDATE"
        );

    const resUpdateForeign =
        buildResponse();

    await PaymentsController.update(
        reqUpdateForeign,
        resUpdateForeign
    );

    console.log(
        "HTTP :",
        resUpdateForeign.statusCode
    );

    console.log(
        "BODY :",
        JSON.stringify(
            resUpdateForeign.body,
            null,
            2
        )
    );

    if (resUpdateForeign.statusCode !== 404) {

        throw new Error(
            `❌ L'agence 1 ne devait pas pouvoir modifier le paiement 17. HTTP reçu : ${resUpdateForeign.statusCode}`
        );

    }

    console.log(
        "✅ Modification inter-agence refusée."
    );

    // =========================================================
    // 5. VÉRIFIER QUE PAYMENT 17 N'A PAS BOUGÉ
    // =========================================================

    const paymentAfterForeignUpdate =
        await db.query(
            `
            SELECT
                id,
                agency_id,
                payment_date,
                reference,
                status,
                notes,
                receipt_path
            FROM marega.payments
            WHERE id = $1
            `,
            [paymentId]
        );

    console.log(
        "\nPAYMENT 17 APRÈS TENTATIVE AGENCE 1 :"
    );

    console.table(
        paymentAfterForeignUpdate.rows
    );

    const paymentAfter =
        paymentAfterForeignUpdate.rows[0];

    const foreignUpdateChangedPayment =

        String(paymentAfter.id) !==
            String(payment.id) ||

        String(paymentAfter.agency_id) !==
            String(payment.agency_id) ||

        String(paymentAfter.payment_date) !==
            String(payment.payment_date) ||

        String(paymentAfter.reference ?? "") !==
            String(payment.reference ?? "") ||

        String(paymentAfter.status ?? "") !==
            String(payment.status ?? "") ||

        String(paymentAfter.notes ?? "") !==
            String(payment.notes ?? "") ||

        String(paymentAfter.receipt_path ?? "") !==
            String(payment.receipt_path ?? "");


    if (foreignUpdateChangedPayment) {

        console.log("\nAVANT :");
        console.log(
            JSON.stringify(
                payment,
                null,
                2
            )
        );

        console.log("\nAPRÈS :");
        console.log(
            JSON.stringify(
                paymentAfter,
                null,
                2
            )
        );

        throw new Error(
            "❌ Le paiement 17 a été modifié par l'agence 1."
        );

    }

    console.log(
        "✅ Le paiement 17 est strictement inchangé."
    );

    // =========================================================
    // 6. AGENCE 1 → CREATE AVEC DONNÉES AGENCE 6
    // =========================================================

    console.log("\n========================================");
    console.log("3) AGENCE 1 → CRÉER AVEC DONNÉES AGENCE 6");
    console.log("========================================\n");

    const foreignRentResult =
        await db.query(
            `
            SELECT
                id,
                agency_id,
                tenant_id,
                lease_id,
                amount
            FROM marega.rents
            WHERE agency_id = $1
              AND status = 'Impayé'
            ORDER BY id
            LIMIT 1
            `,
            [agencyB]
        );

    if (foreignRentResult.rows.length === 0) {

        throw new Error(
            "Aucun loyer impayé disponible dans l'agence 6 pour le test."
        );

    }

    const foreignRent =
        foreignRentResult.rows[0];

    console.log(
        "LOYER AGENCE 6 UTILISÉ POUR LA TENTATIVE :"
    );

    console.table([
        foreignRent
    ]);

    const crossAgencyCreateReq =
        buildReq(
            agency1User.user_id,
            agencyA,

            {
                tenant_id:
                    foreignRent.tenant_id,

                lease_id:
                    foreignRent.lease_id,

                rent_id:
                    foreignRent.id,

                payment_month:
                    "2035-01-01",

                amount:
                    Number(foreignRent.amount),

                payment_date:
                    "2035-01-05",

                payment_method:
                    "Virement",

                reference:
                    `TEST-CROSS-AGENCY-CREATE-${Date.now()}`,

                status:
                    "Payé",

                notes:
                    "TENTATIVE AGENCE 1 AVEC DONNEES AGENCE 6"

            },

            null,

            "TEST-CROSS-AGENCY-CREATE"
        );

    const crossAgencyCreateRes =
        buildResponse();

    await PaymentsController.create(
        crossAgencyCreateReq,
        crossAgencyCreateRes
    );

    console.log(
        "HTTP :",
        crossAgencyCreateRes.statusCode
    );

    console.log(
        "BODY :",
        JSON.stringify(
            crossAgencyCreateRes.body,
            null,
            2
        )
    );

    if (crossAgencyCreateRes.statusCode !== 403) {

        throw new Error(
            `❌ La création inter-agence devait être refusée en 403. HTTP reçu : ${crossAgencyCreateRes.statusCode}`
        );

    }

    console.log(
        "✅ Création inter-agence refusée."
    );

    // =========================================================
    // 7. AGENCE 6 → UTILISER UN LOCATAIRE AGENCE 1
    // =========================================================

    console.log("\n========================================");
    console.log("4) AGENCE 6 → DONNÉE TENANT AGENCE 1");
    console.log("========================================\n");

    const agency1TenantResult =
        await db.query(
            `
            SELECT
                id,
                agency_id,
                first_name,
                last_name
            FROM marega.tenants
            WHERE agency_id = $1
            ORDER BY id
            LIMIT 1
            `,
            [agencyA]
        );

    if (agency1TenantResult.rows.length === 0) {

        throw new Error(
            "Aucun locataire trouvé dans l'agence 1."
        );

    }

    const agency1Tenant =
        agency1TenantResult.rows[0];

    console.log(
        "LOCATAIRE AGENCE 1 :"
    );

    console.table([
        agency1Tenant
    ]);

    const reverseCreateReq =
        buildReq(
            13,
            agencyB,

            {
                tenant_id:
                    agency1Tenant.id,

                lease_id:
                    foreignRent.lease_id,

                rent_id:
                    foreignRent.id,

                payment_month:
                    "2035-02-01",

                amount:
                    Number(foreignRent.amount),

                payment_date:
                    "2035-02-05",

                payment_method:
                    "Virement",

                reference:
                    `TEST-REVERSE-CROSS-AGENCY-${Date.now()}`,

                status:
                    "Payé",

                notes:
                    "AGENCE 6 AVEC TENANT AGENCE 1"

            },

            null,

            "TEST-REVERSE-CROSS-AGENCY"
        );

    const reverseCreateRes =
        buildResponse();

    await PaymentsController.create(
        reverseCreateReq,
        reverseCreateRes
    );

    console.log(
        "HTTP :",
        reverseCreateRes.statusCode
    );

    console.log(
        "BODY :",
        JSON.stringify(
            reverseCreateRes.body,
            null,
            2
        )
    );

    if (reverseCreateRes.statusCode !== 403) {

        throw new Error(
            `❌ L'agence 6 ne devait pas pouvoir utiliser le locataire de l'agence 1. HTTP reçu : ${reverseCreateRes.statusCode}`
        );

    }

    console.log(
        "✅ Relation inter-agence inverse refusée."
    );

    // =========================================================
    // 8. ACCÈS NORMAL AGENCE 6
    // =========================================================

    console.log("\n========================================");
    console.log("5) AGENCE 6 → LIRE SON PAYMENT 17");
    console.log("========================================\n");

    const ownPayment =
        await Payment.getCompleteById(
            paymentId,
            agencyB
        );

    if (!ownPayment) {

        throw new Error(
            "❌ L'agence 6 devrait pouvoir lire son propre paiement 17."
        );

    }

    console.log(
        "✅ Accès légitime agence 6 confirmé."
    );

    // =========================================================
    // 9. TEST DIRECT DU MODEL AVEC MAUVAISE AGENCE
    // =========================================================

    const wrongAgencyPayment =
        await Payment.getCompleteById(
            paymentId,
            agencyA
        );

    if (wrongAgencyPayment) {

        throw new Error(
            "❌ Payment.getCompleteById() retourne un paiement avec une mauvaise agence."
        );

    }

    console.log(
        "✅ Payment.getCompleteById() refuse également le mauvais agency_id."
    );

    // =========================================================
    // 10. AUDIT DE L'AGENCE 1
    // =========================================================

    const agency1Audits =
        await AuditLog.getAll({

            agencyId:
                agencyA,

            limit:
                500,

            offset:
                0

        });

    const foreignPaymentAudits =
        agency1Audits.filter(
            audit =>
                Number(audit.entity_id) === paymentId &&
                audit.module === "payments"
        );

    console.log(
        "\nAUDITS AGENCE 1 CONCERNANT PAYMENT 17 :"
    );

    console.table(
        foreignPaymentAudits
    );

    if (
        foreignPaymentAudits.length !== 0
    ) {

        throw new Error(
            "❌ L'agence 1 voit des audits du paiement 17 de l'agence 6."
        );

    }

    console.log(
        "✅ Les audits du paiement 17 restent invisibles pour l'agence 1."
    );

    // =========================================================
    // RÉSULTAT
    // =========================================================

    console.log("\n========================================");
    console.log("✅ TEST ISOLATION PAYMENTS RÉUSSI");
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
