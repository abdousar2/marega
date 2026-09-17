const db = require("../config/database");

class Expense {

    // =========================================================
    // LECTURE
    // =========================================================

    static async getAll(agencyId) {

        const result = await db.query(
            `
            SELECT
                e.*,

                b.name AS building_name,

                a.number AS apartment_number

            FROM marega.expenses e

            LEFT JOIN marega.buildings b
                ON b.id = e.building_id
                AND b.agency_id = e.agency_id

            LEFT JOIN marega.apartments a
                ON a.id = e.apartment_id
                AND a.agency_id = e.agency_id

            WHERE e.agency_id = $1

            ORDER BY
                e.expense_date DESC,
                e.id DESC
            `,
            [agencyId]
        );

        return result.rows;
    }


    // =========================================================
    // LECTURE PAR ID
    // =========================================================

    static async getById(id, agencyId) {

        const result = await db.query(
            `
            SELECT
                e.*,

                b.name AS building_name,

                a.number AS apartment_number

            FROM marega.expenses e

            LEFT JOIN marega.buildings b
                ON b.id = e.building_id
                AND b.agency_id = e.agency_id

            LEFT JOIN marega.apartments a
                ON a.id = e.apartment_id
                AND a.agency_id = e.agency_id

            WHERE
                e.id = $1
                AND e.agency_id = $2
            `,
            [id, agencyId]
        );

        return result.rows[0];
    }


    // =========================================================
    // VALIDATION DES RELATIONS
    // =========================================================

    static async validateRelations(data, agencyId) {

        // -----------------------------------------------------
        // BUILDING
        // -----------------------------------------------------

        if (data.building_id !== undefined && data.building_id !== null) {

            const building = await db.query(
                `
                SELECT id
                FROM marega.buildings
                WHERE
                    id = $1
                    AND agency_id = $2
                `,
                [
                    data.building_id,
                    agencyId
                ]
            );

            if (building.rows.length === 0) {

                const error = new Error(
                    "L'immeuble sélectionné n'appartient pas à votre agence."
                );

                error.status = 403;

                throw error;
            }
        }


        // -----------------------------------------------------
        // APARTMENT
        // -----------------------------------------------------

        if (data.apartment_id !== undefined && data.apartment_id !== null) {

            const apartment = await db.query(
                `
                SELECT id
                FROM marega.apartments
                WHERE
                    id = $1
                    AND agency_id = $2
                `,
                [
                    data.apartment_id,
                    agencyId
                ]
            );

            if (apartment.rows.length === 0) {

                const error = new Error(
                    "L'appartement sélectionné n'appartient pas à votre agence."
                );

                error.status = 403;

                throw error;
            }
        }


        // -----------------------------------------------------
        // COHÉRENCE APPARTEMENT / IMMEUBLE
        // -----------------------------------------------------

        if (
            data.building_id !== undefined &&
            data.building_id !== null &&
            data.apartment_id !== undefined &&
            data.apartment_id !== null
        ) {

            const apartment = await db.query(
                `
                SELECT id
                FROM marega.apartments
                WHERE
                    id = $1
                    AND building_id = $2
                    AND agency_id = $3
                `,
                [
                    data.apartment_id,
                    data.building_id,
                    agencyId
                ]
            );

            if (apartment.rows.length === 0) {

                const error = new Error(
                    "L'appartement ne correspond pas à l'immeuble sélectionné."
                );

                error.status = 400;

                throw error;
            }
        }
    }


    // =========================================================
    // CRÉATION
    // =========================================================

    static async create(data, agencyId) {

        await this.validateRelations(
            data,
            agencyId
        );


        const result = await db.query(
            `
            INSERT INTO marega.expenses
            (
                agency_id,
                expense_date,
                label,
                category,
                amount,
                payment_method,
                beneficiary,
                reference,
                description,
                building_id,
                apartment_id
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
            )

            RETURNING *
            `,
            [
                agencyId,
                data.expense_date,
                data.label,
                data.category,
                data.amount,
                data.payment_method,
                data.beneficiary,
                data.reference,
                data.description,
                data.building_id || null,
                data.apartment_id || null
            ]
        );

        return result.rows[0];
    }


    // =========================================================
    // MODIFICATION
    // =========================================================

    static async update(id, data, agencyId) {

        // -----------------------------------------------------
        // Vérifier que la dépense appartient à l'agence
        // -----------------------------------------------------

        const existing = await this.getById(
            id,
            agencyId
        );

        if (!existing) {
            return null;
        }


        // -----------------------------------------------------
        // Construire les relations finales
        // -----------------------------------------------------

        const finalBuildingId =
            data.building_id !== undefined
                ? data.building_id
                : existing.building_id;

        const finalApartmentId =
            data.apartment_id !== undefined
                ? data.apartment_id
                : existing.apartment_id;


        await this.validateRelations(
            {
                building_id: finalBuildingId,
                apartment_id: finalApartmentId
            },
            agencyId
        );


        const result = await db.query(
            `
            UPDATE marega.expenses

            SET

                expense_date =
                    COALESCE($1, expense_date),

                label =
                    COALESCE($2, label),

                category =
                    COALESCE($3, category),

                amount =
                    COALESCE($4, amount),

                payment_method =
                    COALESCE($5, payment_method),

                beneficiary =
                    COALESCE($6, beneficiary),

                reference =
                    COALESCE($7, reference),

                description =
                    COALESCE($8, description),

                building_id =
                    $9,

                apartment_id =
                    $10,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                id = $11
                AND agency_id = $12

            RETURNING *
            `,
            [
                data.expense_date ?? null,
                data.label ?? null,
                data.category ?? null,
                data.amount ?? null,
                data.payment_method ?? null,
                data.beneficiary ?? null,
                data.reference ?? null,
                data.description ?? null,
                finalBuildingId ?? null,
                finalApartmentId ?? null,
                id,
                agencyId
            ]
        );

        return result.rows[0];
    }


    // =========================================================
    // SUPPRESSION
    // =========================================================

    static async delete(id, agencyId) {

        const result = await db.query(
            `
            DELETE FROM marega.expenses

            WHERE
                id = $1
                AND agency_id = $2

            RETURNING id
            `,
            [
                id,
                agencyId
            ]
        );

        return result.rows.length > 0;
    }

}


module.exports = Expense;