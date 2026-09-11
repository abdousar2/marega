const pool = require("../config/database");

class DocumentTemplateService {

    // =========================================================
    // ENREGISTRER UN TEMPLATE COMPLET
    // =========================================================

    static async createFromAnalysis({
        agencyId,
        name,
        sourceDocumentPath,
        analysis
    }) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");


            // =================================================
            // VALIDATION
            // =================================================

            if (!agencyId) {
                throw new Error(
                    "agencyId est obligatoire."
                );
            }

            if (!analysis) {
                throw new Error(
                    "Analyse du document manquante."
                );
            }

            if (!analysis.document_type) {
                throw new Error(
                    "Le type de document est manquant."
                );
            }


            // =================================================
            // VÉRIFIER QUE L'AGENCE EXISTE
            // =================================================

            const agencyResult = await client.query(
                `
                SELECT id, name
                FROM marega.agencies
                WHERE id = $1
                `,
                [agencyId]
            );

            if (agencyResult.rows.length === 0) {
                throw new Error(
                    `Agence introuvable : ${agencyId}`
                );
            }


            // =================================================
            // 1. TEMPLATE PRINCIPAL
            // =================================================

            const templateResult = await client.query(
                `
                INSERT INTO marega.document_templates
                (
                    agency_id,
                    document_type,
                    name,
                    version,
                    status,
                    source_document_path,
                    definition
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    1,
                    'DRAFT',
                    $4,
                    $5::jsonb
                )
                RETURNING *
                `,
                [
                    agencyId,
                    analysis.document_type,
                    name ||
                        "Template généré automatiquement",
                    sourceDocumentPath || null,

                    JSON.stringify(analysis)
                ]
            );

            const template =
                templateResult.rows[0];


            // =================================================
            // 2. CHAMPS DU TEMPLATE
            // =================================================

            for (
                const field
                of analysis.fields || []
            ) {

                if (!field.code) {
                    continue;
                }

                await client.query(
                    `
                    INSERT INTO marega.template_fields
                    (
                        template_id,
                        code,
                        label,
                        data_type,
                        source,
                        required,
                        default_value,
                        confidence
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7::jsonb,
                        $8
                    )
                    `,
                    [

                        template.id,

                        field.code,

                        field.label ||
                            field.code,

                        field.data_type ||
                            "string",

                        field.source ||
                            null,

                        field.required === true,

                        // IMPORTANT :
                        // la valeur détectée est conservée
                        // dans definition,
                        // mais pas comme valeur
                        // par défaut du template.
                        JSON.stringify(null),

                        field.confidence ??
                            null
                    ]
                );

            }


            // =================================================
            // 3. CLAUSES
            // =================================================

            for (
                const clause
                of analysis.clauses || []
            ) {

                if (!clause.code) {
                    continue;
                }

                await client.query(
                    `
                    INSERT INTO marega.template_clauses
                    (
                        template_id,
                        code,
                        title,
                        content,
                        clause_order,
                        enabled,
                        variables
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7::jsonb
                    )
                    `,
                    [

                        template.id,

                        clause.code,

                        clause.title ||
                            clause.code,

                        clause.content ||
                            "",

                        Number(
                            clause.clause_order || 0
                        ),

                        clause.enabled !== false,

                        JSON.stringify(
                            clause.variables || []
                        )

                    ]
                );

            }


            // =================================================
            // 4. TERMES DE L'AGENCE
            // =================================================

            for (
                const term
                of analysis.terms || []
            ) {

                if (!term.code) {
                    continue;
                }

                await client.query(
                    `
                    INSERT INTO marega.agency_terms
                    (
                        agency_id,
                        code,
                        label,
                        value_type,
                        default_value,
                        description,
                        source_template_id
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5::jsonb,
                        $6,
                        $7
                    )
                    ON CONFLICT
                    (
                        agency_id,
                        code
                    )
                    DO UPDATE SET

                        label =
                            EXCLUDED.label,

                        value_type =
                            EXCLUDED.value_type,

                        default_value =
                            EXCLUDED.default_value,

                        description =
                            EXCLUDED.description,

                        source_template_id =
                            EXCLUDED.source_template_id
                    `,
                    [

                        agencyId,

                        term.code,

                        term.label ||
                            term.code,

                        term.value_type ||
                            "string",

                        JSON.stringify(
                            term.default_value ??
                            null
                        ),

                        term.description ||
                            null,

                        template.id

                    ]
                );

            }

            // =================================================
            // COMMIT
            // =================================================

            await client.query("COMMIT");


            // =================================================
            // RÉSULTAT
            // =================================================

            return {

                template,

                field_count:
                    (analysis.fields || []).length,

                term_count:
                    (analysis.terms || []).length,

                clause_count:
                    (analysis.clauses || []).length

            };


        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    }

}

module.exports =
    DocumentTemplateService;