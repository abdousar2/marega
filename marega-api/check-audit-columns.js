require("dotenv").config();

const db = require("./src/config/database");

db.query(`
    SELECT
        column_name,
        data_type,
        column_default,
        is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'marega'
      AND table_name = 'audit_logs'
    ORDER BY ordinal_position
`)
.then(result => {

    console.table(result.rows);

    process.exit(0);

})
.catch(error => {

    console.error(error);

    process.exit(1);

});