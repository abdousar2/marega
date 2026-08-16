const db = require("../config/database");

class AuditLog {

    // =========================================================
    // ENREGISTRER UNE ACTION
    // =========================================================

    static async create({

        user_id = null,

        action,

        module,

        entity_id = null,

        details = null,

        ip_address = null,

        user_agent = null

    }) {

        const result = await db.query(

            `
            INSERT INTO marega.audit_logs
            (
                user_id,
                action,
                module,
                entity_id,
                details,
                ip_address,
                user_agent
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
                user_id,
                action,
                module,
                entity_id,
                details,
                ip_address,
                user_agent,
                created_at
            `,

            [
                user_id,
                action,
                module,
                entity_id,
                details,
                ip_address,
                user_agent
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // TOUS LES JOURNAUX
    // =========================================================

    static async getAll({

        limit = 100,

        offset = 0

    } = {}) {

        const result = await db.query(

            `
            SELECT
                a.id,
                a.user_id,
                a.action,
                a.module,
                a.entity_id,
                a.details,
                a.ip_address,
                a.user_agent,
                a.created_at,

                u.first_name,
                u.last_name,
                u.email,
                u.role

            FROM marega.audit_logs a

            LEFT JOIN marega.users u
                ON u.id = a.user_id

            ORDER BY a.created_at DESC

            LIMIT $1
            OFFSET $2
            `,

            [
                limit,
                offset
            ]

        );

        return result.rows;

    }

}

module.exports = AuditLog;