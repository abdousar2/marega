require("dotenv").config();

const db = require("./src/config/database");

async function fix() {

    try {

        console.log("?? Modification de la contrainte payments_tenant_id_fkey...");

        await db.query(`
            ALTER TABLE marega.payments
            DROP CONSTRAINT payments_tenant_id_fkey
        `);

        await db.query(`
            ALTER TABLE marega.payments
            ADD CONSTRAINT payments_tenant_id_fkey
            FOREIGN KEY (tenant_id)
            REFERENCES marega.tenants(id)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);

        console.log("? Contrainte modifiée avec succès.");

    }

    catch (error) {

        console.error("? Erreur :", error);

    }

    finally {

        process.exit();

    }

}

fix();
