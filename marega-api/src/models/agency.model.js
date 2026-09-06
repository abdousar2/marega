const db = require("../config/database");


class Agency {

    // =========================================================
    // TOUTES LES AGENCES ACTIVES
    // =========================================================

    static async getAll() {

        const result = await db.query(`

            SELECT

                id,
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                status,
                ninea,
                rccm,
                logo_path,
                contract_template_path,
                receipt_template_path,
                created_at,
                updated_at

            FROM marega.agencies

            WHERE status = 'active'

            ORDER BY name ASC

        `);

        return result.rows;

    }


    // =========================================================
    // AGENCE PAR ID
    // =========================================================

    static async getById(id) {

        const result = await db.query(

            `
            SELECT

                id,
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                status,
                ninea,
                rccm,
                logo_path,
                contract_template_path,
                receipt_template_path,
                created_at,
                updated_at

            FROM marega.agencies

            WHERE id = $1
            `,

            [id]

        );

        return result.rows[0];

    }


    // =========================================================
    // DONNÉES DE L'AGENCE POUR LES DOCUMENTS
    // =========================================================

    static async getDocumentSettings(agencyId) {

        const result = await db.query(

            `
            SELECT

                id,
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                ninea,
                rccm,

                logo_path,
                contract_template_path,
                receipt_template_path

            FROM marega.agencies

            WHERE id = $1

              AND status = 'active'
            `,

            [
                agencyId
            ]

        );

        return result.rows[0];

    }


    // =========================================================
    // METTRE À JOUR LES DOCUMENTS DE L'AGENCE
    // =========================================================

    static async updateDocuments(
        agencyId,
        documents
    ) {

        const result = await db.query(

            `
            UPDATE marega.agencies

            SET

                logo_path =
                    COALESCE(
                        $1,
                        logo_path
                    ),

                contract_template_path =
                    COALESCE(
                        $2,
                        contract_template_path
                    ),

                receipt_template_path =
                    COALESCE(
                        $3,
                        receipt_template_path
                    ),

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = $4

            RETURNING

                id,
                name,
                type,
                city,
                country,
                address,
                phone,
                email,
                status,
                ninea,
                rccm,
                logo_path,
                contract_template_path,
                receipt_template_path,
                created_at,
                updated_at
            `,

            [

                documents.logo_path,

                documents.contract_template_path,

                documents.receipt_template_path,

                agencyId

            ]

        );

        return result.rows[0];

    }

}


module.exports = Agency;