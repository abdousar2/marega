require("dotenv").config();

const migrate = require("./database/migrate");
const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

async function start() {

    try {

        await pool.query("SELECT NOW()");

        console.log("✅ Base PostgreSQL connectée");

        await migrate();

        app.listen(PORT, () => {

            console.log("");
            console.log("==================================");
            console.log(" MAREGA API");
            console.log("==================================");
            console.log(`🚀 http://localhost:${PORT}`);
            console.log("");

        });

    }

    catch (err) {

        console.error("❌ Impossible de démarrer MAREGA :", err);

        process.exit(1);

    }

}

start();