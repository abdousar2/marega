const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

async function migrate() {

    console.log("📦 Vérification du schéma MAREGA...");

    await pool.query(`
        CREATE SCHEMA IF NOT EXISTS marega;
    `);

    console.log("✅ Schéma marega prêt.");

    await pool.query(`
        CREATE TABLE IF NOT EXISTS marega.migrations (

            id SERIAL PRIMARY KEY,

            filename VARCHAR(255) UNIQUE NOT NULL,

            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        );
    `);

    console.log("✅ Table migrations prête.");

    const migrationsFolder = path.join(__dirname, "migrations");

    if (!fs.existsSync(migrationsFolder)) {
        console.log("Aucune migration.");
        return;
    }

    const files = fs
        .readdirSync(migrationsFolder)
        .filter(file => file.endsWith(".sql"))
        .sort();

    for (const file of files) {

        const exists = await pool.query(

            `
            SELECT *
            FROM marega.migrations
            WHERE filename=$1
            `,

            [file]

        );

        if (exists.rows.length > 0) {

            console.log(`⏩ ${file} déjà exécutée`);

            continue;
        }

        console.log(`▶ Exécution ${file}`);

        const sql = fs.readFileSync(
            path.join(migrationsFolder, file),
            "utf8"
        );

        await pool.query(sql);

        await pool.query(

            `
            INSERT INTO marega.migrations(filename)
            VALUES($1)
            `,

            [file]

        );

        console.log(`✅ ${file} terminée`);
    }

}

module.exports = migrate;