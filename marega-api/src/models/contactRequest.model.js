const db = require("../config/database");

class ContactRequest {

    static async create(data) {

        const result = await db.query(

            `
            INSERT INTO marega.contact_requests
            (
                name,
                phone,
                email,
                company,
                buildings,
                tenants,
                message
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )

            RETURNING
                id,
                name,
                phone,
                email,
                company,
                buildings,
                tenants,
                message,
                status,
                created_at
            `,

            [
                data.name,
                data.phone,
                data.email,
                data.company,
                data.buildings || null,
                data.tenants || null,
                data.message
            ]

        );

        return result.rows[0];

    }

}

module.exports = ContactRequest;