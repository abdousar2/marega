require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("\n❌ DATABASE_URL est introuvable dans .env");
    process.exit(1);
}

const pgDump = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe";

if (!fs.existsSync(pgDump)) {
    console.error("\n❌ pg_dump introuvable :");
    console.error(pgDump);
    process.exit(1);
}

const backupDir = path.join(__dirname, "backups");

fs.mkdirSync(
    backupDir,
    { recursive: true }
);

const timestamp =
    new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .replace("Z", "");

const backupFile =
    path.join(
        backupDir,
        `marega-full-${timestamp}.dump`
    );

console.log("\n========================================");
console.log(" SAUVEGARDE COMPLETE MAREGA");
console.log("========================================\n");

console.log("pg_dump :", pgDump);
console.log("Fichier :", backupFile);
console.log("");

const result =
    spawnSync(
        pgDump,
        [
            databaseUrl,
            "--format=custom",
            `--file=${backupFile}`
        ],
        {
            stdio: "inherit",
            env: {
                ...process.env,
                PGSSLMODE: "require"
            }
        }
    );

if (result.error) {

    console.error("\n❌ ERREUR EXECUTION pg_dump :");
    console.error(result.error);

    process.exit(1);
}

if (result.status !== 0) {

    console.error(
        `\n❌ pg_dump s'est terminé avec le code ${result.status}`
    );

    process.exit(result.status || 1);
}

if (!fs.existsSync(backupFile)) {

    console.error(
        "\n❌ Le fichier de sauvegarde n'a pas été créé."
    );

    process.exit(1);
}

const stats =
    fs.statSync(backupFile);

if (stats.size === 0) {

    console.error(
        "\n❌ Le fichier de sauvegarde est vide."
    );

    process.exit(1);
}

console.log("\n========================================");
console.log(" ✅ SAUVEGARDE TERMINEE");
console.log("========================================\n");

console.log(
    "Taille :",
    stats.size,
    "octets"
);

console.log(
    "Fichier :",
    backupFile
);

console.log("");

