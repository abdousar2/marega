require("dotenv").config();
const db = require("./src/config/database");

async function inspect() {
    try {
        const columns = await db.query(`
            SELECT
                column_name,
                data_type,
                is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'marega'
              AND table_name = 'expenses'
            ORDER BY ordinal_position
        `);

        console.table(columns.rows);

        const count = await db.query(`
            SELECT
                COUNT(*) AS total_expenses,
                COUNT(building_id) AS with_building,
                COUNT(apartment_id) AS with_apartment
            FROM marega.expenses
        `);

        console.table(count.rows);

        const expenses = await db.query(`
            SELECT
                id,
                building_id,
                apartment_id,
                expense_date,
                amount,
                label
            FROM marega.expenses
            ORDER BY id
            LIMIT 20
        `);

        console.table(expenses.rows);

    } catch (error) {
        console.error("ERREUR :", error);
    } finally {
        await db.end();
    }
}

inspect();
