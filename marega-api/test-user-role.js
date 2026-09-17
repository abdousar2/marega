require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./src/models/user.model");
const db = require("./src/config/database");

(async () => {

    let userId = null;

    try {

        const email =
            `test-role-${Date.now()}@marega.local`;

        const passwordHash =
            await bcrypt.hash(
                "TestRole123!",
                12
            );


        // -------------------------------------------------
        // CRÉATION DANS AGENCE 1
        // -------------------------------------------------

        const user =
            await User.create(
                {
                    first_name: "Test",
                    last_name: "Role",
                    email,
                    password_hash: passwordHash,
                    role: "AGENT",
                    active: true
                },
                1
            );

        userId = user.id;


        // -------------------------------------------------
        // AJOUT D'UNE DEUXIÈME AGENCE
        // -------------------------------------------------

        await db.query(
            `
            INSERT INTO marega.agency_users
            (
                agency_id,
                user_id,
                role,
                active
            )
            VALUES
            (
                $1,
                $2,
                $3,
                TRUE
            )
            `,
            [
                5,
                userId,
                "AGENT"
            ]
        );


        console.log("=== AVANT MODIFICATION ===");

        let r =
            await db.query(
                "SELECT agency_id,role,active FROM marega.agency_users WHERE user_id=$1 ORDER BY agency_id",
                [userId]
            );

        console.table(r.rows);


        // -------------------------------------------------
        // MODIFIER LE RÔLE DANS AGENCE 1
        // -------------------------------------------------

        await User.update(
            userId,
            {
                first_name: "Test",
                last_name: "Role",
                email,
                role: "RESPONSABLE",
                active: true
            },
            1
        );


        console.log("\n=== APRÈS MODIFICATION AGENCE 1 ===");

        r =
            await db.query(
                "SELECT agency_id,role,active FROM marega.agency_users WHERE user_id=$1 ORDER BY agency_id",
                [userId]
            );

        console.table(r.rows);


        const agency1 =
            r.rows.find(
                row => row.agency_id === 1
            );

        const agency5 =
            r.rows.find(
                row => row.agency_id === 5
            );


        if (
            agency1?.role === "RESPONSABLE"
            &&
            agency5?.role === "AGENT"
        ) {

            console.log(
                "\n? TEST ROLE PAR AGENCE RÉUSSI"
            );

        } else {

            console.log(
                "\n? TEST ROLE PAR AGENCE ÉCHOUÉ"
            );

        }

    }

    catch (error) {

        console.error(
            "\n? ERREUR :",
            error
        );

    }

    finally {

        if (userId) {

            await db.query(
                "DELETE FROM marega.agency_users WHERE user_id=$1",
                [userId]
            );

            await db.query(
                "DELETE FROM marega.users WHERE id=$1",
                [userId]
            );

            console.log(
                "\n?? Utilisateur de test nettoyé."
            );
        }

        await db.end();
    }

})();
