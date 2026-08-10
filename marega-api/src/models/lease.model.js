const db = require("../config/database");

class Lease {

    static async getAll() {

        const result = await db.query(`
            SELECT *
            FROM marega.leases
            ORDER BY created_at DESC
        `);

        return result.rows;

    }

    static async getById(id) {

        const result = await db.query(
            `
            SELECT *
            FROM marega.leases
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0];

    }

    static async getCompleteById(id) {

        const result = await db.query(

            `
            SELECT

                l.*,

                t.first_name,
                t.last_name,

                CONCAT(
                    t.first_name,
                    ' ',
                    t.last_name
                ) AS tenant_name,

                t.phone,
                t.email,
                t.profession,

                a.number AS apartment_number,
                a.type AS apartment_type,
                a.surface,
                a.rent AS apartment_rent,
                a.deposit,

                b.name AS building_name,
                b.address AS building_address

            FROM marega.leases l

            JOIN marega.tenants t
                ON t.id = l.tenant_id

            JOIN marega.apartments a
                ON a.id = l.apartment_id

            JOIN marega.buildings b
                ON b.id = a.building_id

            WHERE l.id = $1
            `,

            [id]

        );

        return result.rows[0];

    }

    static async generateContractNumber() {

        const year = new Date().getFullYear();

        const result = await db.query(

            `
            SELECT contract_number

            FROM marega.leases

            WHERE contract_number LIKE $1

            ORDER BY id DESC

            LIMIT 1
            `,

            [`MRG-${year}-%`]

        );

        let next = 1;

        if (result.rows.length > 0) {

            const last = result.rows[0].contract_number;

            const lastNumber = parseInt(
                last.split("-")[2],
                10
            );

            next = lastNumber + 1;

        }

        return `MRG-${year}-${String(next).padStart(6, "0")}`;

    }

    static async create(data) {

        const contractNumber =
            await Lease.generateContractNumber();

        const result = await db.query(

            `
            INSERT INTO marega.leases
            (
                apartment_id,
                tenant_id,
                contract_number,
                start_date,
                end_date,
                monthly_rent,
                charges,
                deposit,
                payment_day,
                status,
                notes,
                identity_number,
                level
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            )

            RETURNING *
            `,

            [
                data.apartment_id,
                data.tenant_id,
                contractNumber,
                data.start_date,
                data.end_date,
                data.monthly_rent,
                data.charges,
                data.deposit,
                data.payment_day,
                data.status,
                data.notes,
                data.identity_number,
                data.level
            ]

        );

        return result.rows[0];

    }

    static async update(id, data) {

        const result = await db.query(

            `
            UPDATE marega.leases

            SET

                apartment_id = $1,
                tenant_id = $2,
                contract_number = $3,
                start_date = $4,
                end_date = $5,
                monthly_rent = $6,
                charges = $7,
                deposit = $8,
                payment_day = $9,
                status = $10,
                notes = $11,
                identity_number = $12,
                level = $13,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $14

            RETURNING *
            `,

            [
                data.apartment_id,
                data.tenant_id,
                data.contract_number,
                data.start_date,
                data.end_date,
                data.monthly_rent,
                data.charges,
                data.deposit,
                data.payment_day,
                data.status,
                data.notes,
                data.identity_number,
                data.level,
                id
            ]

        );

        return result.rows[0];

    }

    static async delete(id) {

        await db.query(

            `
            DELETE FROM marega.leases
            WHERE id = $1
            `,

            [id]

        );

        return true;

    }

    static async updatePdfPath(id, pdfPath) {

        await db.query(

            `
            UPDATE marega.leases

            SET

                pdf_path = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2
            `,

            [

                pdfPath,
                id

            ]

        );

    }

}

module.exports = Lease;