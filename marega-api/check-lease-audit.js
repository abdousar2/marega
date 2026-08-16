require("dotenv").config();

const db =
    require("./src/config/database");


db.query(`
    SELECT
        id,
        user_id,
        action,
        module,
        entity_id,
        details,
        created_at

    FROM marega.audit_logs

    WHERE module = 'leases'

    ORDER BY id DESC

    LIMIT 5
`)

.then(result => {

    console.dir(
        result.rows,
        {
            depth: null
        }
    );

    process.exit(0);

})

.catch(error => {

    console.error(error);

    process.exit(1);

});