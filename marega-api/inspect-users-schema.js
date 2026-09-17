require("dotenv").config();

const db = require("./src/config/database");

(async () => {

    const users = await db.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'marega' AND table_name = 'users' ORDER BY ordinal_position"
    );

    console.log("=== USERS ===");
    console.table(users.rows);


    const agencyUsers = await db.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'marega' AND table_name = 'agency_users' ORDER BY ordinal_position"
    );

    console.log("=== AGENCY_USERS ===");
    console.table(agencyUsers.rows);


    await db.end();

})().catch(error => {

    console.error(error);
    process.exit(1);

});
