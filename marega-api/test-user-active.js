require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./src/models/user.model");
const db = require("./src/config/database");

(async () => {

    let userId = null;

    try {

        const email =
            `test-active-${Date.now()}@marega.local`;

        const passwordHash =
            await bcrypt.hash(
                "TestActive123!",
                12
            );


        // -------------------------------------------------
        // CRÉATION
        // -------------------------------------------------

        console.log("=== CRÉATION ===");

        const user =
            await User.create(
                {
                    first_name: "Test",
                    last_name: "Active",
                    email,
                    password_hash: passwordHash,
                    role: "AGENT",
                    active: true
                },
                1
            );

        userId = user.id;

        console.log(user);


        // -------------------------------------------------
        // ÉTAT INITIAL
        // -------------------------------------------------

        console.log("\n=== ÉTAT INITIAL ===");

        let r =
            await db.query(
                "SELECT u.id,u.active AS user_active,au.agency_id,au.role,au.active AS agency_active FROM marega.users u JOIN marega.agency_users au ON au.user_id=u.id WHERE u.id=$1",
                [userId]
            );

        console.table(r.rows);


        // -------------------------------------------------
        // DÉSACTIVATION AGENCE 1
        // -------------------------------------------------

        console.log("\n=== updateActive(false, agence 1) ===");

        const updated =
            await User.updateActive(
                userId,
                false,
                1
            );

        console.log(updated);


        // -------------------------------------------------
        // VÉRIFICATION
        // -------------------------------------------------

        console.log("\n=== APRÈS DÉSACTIVATION ===");

        r =
            await db.query(
                "SELECT u.id,u.active AS user_active,au.agency_id,au.role,au.active AS agency_active FROM marega.users u JOIN marega.agency_users au ON au.user_id=u.id WHERE u.id=$1",
                [userId]
            );

        console.table(r.rows);


        const row =
            r.rows[0];

        if (
            row.user_active === true
            &&
            row.agency_active === false
        ) {

            console.log(
                "\n? TEST updateActive RÉUSSI"
            );

        } else {

            console.log(
                "\n? TEST updateActive ÉCHOUÉ"
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
