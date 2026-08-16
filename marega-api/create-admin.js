const bcrypt = require("bcryptjs");
const pool = require("./src/config/database");

async function createAdmin() {

    const firstName = "Admin";
    const lastName = "MAREGA";

    const email = "admin@marega.sn";

    const password = "MaregaAdmin2026!";

    const passwordHash =
        await bcrypt.hash(password, 12);

    try {

        const result = await pool.query(
            `
            INSERT INTO marega.users (
                first_name,
                last_name,
                email,
                password_hash,
                role,
                active
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                first_name,
                last_name,
                email,
                role,
                active
            `,
            [
                firstName,
                lastName,
                email,
                passwordHash,
                "ADMIN",
                true
            ]
        );

        console.log("");
        console.log("=================================");
        console.log(" ADMIN MAREGA CRÉÉ");
        console.log("=================================");
        console.log(result.rows[0]);
        console.log("");
        console.log("Email :", email);
        console.log("Mot de passe :", password);
        console.log("");

    }

    catch (err) {

        console.error(
            "Erreur lors de la création :",
            err
        );

    }

    finally {

        await pool.end();

    }

}

createAdmin();