require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./src/models/user.model");
const db = require("./src/config/database");

(async () => {

    const testEmail =
        `test-isolation-${Date.now()}@marega.local`;

    try {

        const passwordHash =
            await bcrypt.hash(
                "TestIsolation123!",
                12
            );


        console.log("=== CRÉATION TEST ===");

        const user =
            await User.create(
                {
                    first_name: "Test",
                    last_name: "Isolation",
                    email: testEmail,
                    password_hash: passwordHash,
                    role: "AGENT",
                    active: true
                },
                1
            );

        console.log(user);


        console.log("\n=== VÉRIFICATION USERS ===");

        const u =
            await db.query(
                "SELECT id,email,role,active FROM marega.users WHERE id=$1",
                [user.id]
            );

        console.table(u.rows);


        console.log("\n=== VÉRIFICATION AGENCY_USERS ===");

        const au =
            await db.query(
                "SELECT agency_id,user_id,role,active FROM marega.agency_users WHERE user_id=$1",
                [user.id]
            );

        console.table(au.rows);


        console.log("\n=== SUPPRESSION DE L'ASSOCIATION AGENCE 1 ===");

        const deleted =
            await User.delete(
                user.id,
                1
            );

        console.log(
            "Association supprimée :",
            deleted
        );


        console.log("\n=== COMPTE GLOBAL APRÈS RETRAIT ===");

        const afterUser =
            await db.query(
                "SELECT id,email FROM marega.users WHERE id=$1",
                [user.id]
            );

        console.table(afterUser.rows);


        console.log("\n=== ASSOCIATION APRÈS RETRAIT ===");

        const afterMembership =
            await db.query(
                "SELECT agency_id,user_id FROM marega.agency_users WHERE user_id=$1",
                [user.id]
            );

        console.table(afterMembership.rows);

    }

    catch (error) {

        console.error(
            "? TEST ERREUR :",
            error
        );

    }

    finally {

        await db.end();

    }

})();
