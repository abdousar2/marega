const bcrypt = require("bcryptjs");
const readline = require("readline");
const db = require("../config/database");


function askHidden(question) {

    return new Promise((resolve) => {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        process.stdout.write(question);

        let password = "";

        process.stdin.setRawMode(true);

        process.stdin.resume();

        process.stdin.setEncoding("utf8");


        const onData = (char) => {

            if (char === "\r" || char === "\n") {

                process.stdin.setRawMode(false);

                process.stdin.removeListener(
                    "data",
                    onData
                );

                rl.close();

                console.log("");

                resolve(password);

                return;

            }


            if (char === "\u0003") {

                process.stdin.setRawMode(false);

                process.exit();

            }


            if (char === "\u007f") {

                if (password.length > 0) {

                    password =
                        password.slice(0, -1);

                    process.stdout.write(
                        "\b \b"
                    );

                }

                return;

            }


            password += char;

            process.stdout.write("*");

        };

        process.stdin.on("data", onData);

    });

}


async function createPlatformAdmin() {

    try {

        const firstName = "Abdourahmane";
        const lastName = "Sarr";
        const email = "abdou_sar2@techtradisport.sn";


        console.log("");
        console.log("========================================");
        console.log(" CREATION PLATFORM ADMIN");
        console.log("========================================");
        console.log("");

        console.log(`Prénom : ${firstName}`);
        console.log(`Nom    : ${lastName}`);
        console.log(`Email  : ${email}`);
        console.log("Rôle   : PLATFORM_ADMIN");
        console.log("");


        const existing = await db.query(

            `
            SELECT id, email, role
            FROM marega.users
            WHERE LOWER(email) = LOWER($1)
            `,

            [email]

        );


        if (existing.rows.length > 0) {

            console.log(
                "⚠️ Un utilisateur existe déjà avec cet email."
            );

            console.log(existing.rows[0]);

            process.exit(0);

        }


        const password =
            await askHidden(
                "Nouveau mot de passe : "
            );


        if (!password || password.length < 8) {

            console.error(
                "\n❌ Le mot de passe doit contenir au moins 8 caractères."
            );

            process.exit(1);

        }


        const confirmation =
            await askHidden(
                "Confirmer le mot de passe : "
            );


        if (password !== confirmation) {

            console.error(
                "\n❌ Les mots de passe ne correspondent pas."
            );

            process.exit(1);

        }


        console.log("");
        console.log(
            "🔐 Génération du hash..."
        );


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const result = await db.query(

            `
            INSERT INTO marega.users
            (
                first_name,
                last_name,
                email,
                password_hash,
                role,
                active
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                'PLATFORM_ADMIN',
                TRUE
            )

            RETURNING
                id,
                first_name,
                last_name,
                email,
                role,
                active,
                created_at
            `,

            [
                firstName,
                lastName,
                email,
                passwordHash
            ]

        );


        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            " ✅ PLATFORM ADMIN CRÉÉ"
        );
        console.log(
            "========================================"
        );

        console.table(result.rows);

        console.log("");
        console.log(
            "Le mot de passe n'a pas été enregistré en clair."
        );
        console.log("");

    }

    catch (error) {

        console.error(
            "❌ Erreur création PLATFORM_ADMIN :",
            error
        );

    }

    finally {

        await db.end();

    }

}


createPlatformAdmin();