require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const ROOT = __dirname;

function normalizeDbPath(value) {

    if (!value) {
        return null;
    }

    let p = String(value)
        .replace(/\\/g, "/")
        .toLowerCase();

    p = p.replace(/^\/+/, "");

    return p;
}

function localRelative(filePath) {

    return path
        .relative(ROOT, filePath)
        .replace(/\\/g, "/")
        .toLowerCase();
}

async function main() {

    const client = await pool.connect();

    try {

        console.log("\n====================================================");
        console.log(" RAPPROCHEMENT BASE ↔ FICHIERS");
        console.log(" LECTURE SEULE");
        console.log("====================================================\n");


        // ==================================================
        // 1. FICHIERS REFERENCÉS PAR LA BASE
        // ==================================================

        const referenced = new Set();


        const agencies =
            await client.query(`
                SELECT
                    id,
                    name,
                    logo_path,
                    contract_template_path,
                    receipt_template_path
                FROM marega.agencies
                ORDER BY id;
            `);

        for (const row of agencies.rows) {

            for (const field of [
                "logo_path",
                "contract_template_path",
                "receipt_template_path"
            ]) {

                const value =
                    normalizeDbPath(row[field]);

                if (value) {
                    referenced.add(value);
                }
            }
        }


        const leases =
            await client.query(`
                SELECT
                    id,
                    agency_id,
                    contract_number,
                    pdf_path
                FROM marega.leases
                WHERE pdf_path IS NOT NULL
                ORDER BY id;
            `);

        for (const row of leases.rows) {

            const value =
                normalizeDbPath(row.pdf_path);

            if (value) {
                referenced.add(value);
            }
        }


        const payments =
            await client.query(`
                SELECT
                    id,
                    agency_id,
                    receipt_path
                FROM marega.payments
                WHERE receipt_path IS NOT NULL
                ORDER BY id;
            `);

        for (const row of payments.rows) {

            const value =
                normalizeDbPath(row.receipt_path);

            if (value) {
                referenced.add(value);
            }
        }


        const templates =
            await client.query(`
                SELECT
                    id,
                    agency_id,
                    name,
                    source_document_path
                FROM marega.document_templates
                WHERE source_document_path IS NOT NULL
                ORDER BY id;
            `);

        for (const row of templates.rows) {

            let value =
                String(row.source_document_path)
                    .replace(/\\/g, "/")
                    .toLowerCase();

            const marker =
                value.indexOf("/uploads/");

            if (marker >= 0) {

                value =
                    value
                        .substring(marker + 1)
                        .replace(/^\/+/, "");

                referenced.add(value);

            }
        }


        console.log("=== FICHIERS ACTUELLEMENT REFERENCES ===\n");

        const references =
            Array.from(referenced)
                .sort();

        for (const file of references) {

            console.log("  " + file);
        }


        console.log(
            "\nTotal fichiers référencés :",
            references.length
        );


        // ==================================================
        // 2. FICHIERS LOCAUX
        // ==================================================

        console.log("\n====================================================");
        console.log(" FICHIERS LOCAUX NON REFERENCES");
        console.log("====================================================\n");


        const localRoots = [
            path.join(ROOT, "uploads"),
            path.join(ROOT, "contracts"),
            path.join(ROOT, "receipts")
        ];


        let orphanCount = 0;


        for (const root of localRoots) {

            if (!fs.existsSync(root)) {
                continue;
            }


            const files = [];

            function walk(directory) {

                for (const entry of
                    fs.readdirSync(
                        directory,
                        { withFileTypes: true }
                    )
                ) {

                    const fullPath =
                        path.join(
                            directory,
                            entry.name
                        );

                    if (entry.isDirectory()) {

                        walk(fullPath);

                    } else {

                        files.push(fullPath);

                    }
                }
            }


            walk(root);


            for (const filePath of files) {

                const relative =
                    localRelative(filePath);

                if (
                    !referenced.has(relative)
                ) {

                    orphanCount++;

                    const stats =
                        fs.statSync(filePath);

                    console.log(
                        `${relative} | ${stats.size} octets`
                    );
                }
            }
        }


        console.log(
            "\nTotal fichiers non référencés :",
            orphanCount
        );


        // ==================================================
        // 3. FICHIERS CIBLÉS
        // ==================================================

        console.log("\n====================================================");
        console.log(" VERIFICATION FICHIERS CIBLES");
        console.log("====================================================\n");


        const targets = [
            "uploads/agencies/5/contract.pdf",
            "uploads/agencies/5/logo.jpg",
            "uploads/agencies/5/receipt.pdf",
            "contracts/MRG-2026-000002.pdf",
            "receipts/RECU-17.pdf"
        ];


        for (const target of targets) {

            const fullPath =
                path.join(
                    ROOT,
                    target
                );

            const exists =
                fs.existsSync(fullPath);

            console.log(
                `${target} => ${exists ? "PRESENT" : "ABSENT"}`
            );

            console.log(
                `   DB référence => ${referenced.has(
                    target.toLowerCase()
                ) ? "OUI" : "NON"}`
            );
        }


        // ==================================================
        // 4. SAUVEGARDES VIDES
        // ==================================================

        console.log("\n====================================================");
        console.log(" SAUVEGARDES");
        console.log("====================================================\n");


        const backupDir =
            path.join(
                ROOT,
                "backups"
            );


        if (fs.existsSync(backupDir)) {

            for (
                const file of
                fs.readdirSync(
                    backupDir,
                    { withFileTypes: true }
                )
            ) {

                if (!file.isFile()) {
                    continue;
                }

                const fullPath =
                    path.join(
                        backupDir,
                        file.name
                    );

                const stats =
                    fs.statSync(fullPath);

                console.log(
                    `${file.name} => ${stats.size} octets`
                );
            }
        }


        console.log("\n====================================================");
        console.log(" FIN DU RAPPROCHEMENT");
        console.log(" AUCUNE DONNEE OU FICHIER MODIFIE");
        console.log("====================================================\n");

    } finally {

        client.release();
        await pool.end();

    }
}

main().catch(err => {

    console.error(
        "\n❌ ERREUR :",
        err
    );

    process.exit(1);
});
