const pool = require("../config/database");

class DocumentTemplateService {

    // =========================================================
    // NORMALISER UN TABLEAU
    // =========================================================

    static normalizeArray(value) {

        return Array.isArray(value)
            ? value
            : [];

    }


    // =========================================================
    // EXTRAIRE LES VARIABLES D'UNE CLAUSE
    // =========================================================

    static extractVariablesFromText(text = "") {

        const variables = new Set();

        const regex =
            /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

        let match;

        while (
            (match = regex.exec(text)) !== null
        ) {

            variables.add(
                match[1]
            );

        }

        return [...variables];

    }


    // =========================================================
    // NORMALISER LES VARIABLES
    // =========================================================

    static normalizeVariables(
        clause
    ) {

        const variables = new Set();

        // Variables déjà fournies par l'analyse
        for (
            const variable
            of this.normalizeArray(
                clause.variables
            )
        ) {

            if (
                typeof variable === "string" &&
                variable.trim()
            ) {

                variables.add(
                    variable.trim()
                );

            }

        }


        // Variables réellement présentes
        // dans le contenu
        for (
            const variable
            of this.extractVariablesFromText(
                clause.content
            )
        ) {

            variables.add(variable);

        }


        return [...variables];

    }


    // =========================================================
    // CRÉER UN TEMPLATE COMPLET
    // =========================================================

    static async createFromAnalysis({

        agencyId,
        name,
        sourceDocumentPath,
        analysis

    }) {

        const client =
            await pool.connect();


        try {

            await client.query(
                "BEGIN"
            );


            // =====================================================
            // VALIDATION
            // =====================================================

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


            if (
                !analysis.document_type
            ) {

                throw new Error(
                    "Le type de document est manquant."
                );

            }


            // =====================================================
            // AGENCE
            // =====================================================

            const agencyResult =
                await client.query(

                    `
                    SELECT
                        id,
                        name
                    FROM marega.agencies
                    WHERE id = $1
                    `,

                    [agencyId]

                );


            if (
                agencyResult.rows.length === 0
            ) {

                throw new Error(
                    `Agence introuvable : ${agencyId}`
                );

            }


            // =====================================================
            // NORMALISATION ANALYSE
            // =====================================================

            const fields =
                this.normalizeArray(
                    analysis.fields
                );


            const clauses =
                this.normalizeArray(
                    analysis.clauses
                );


            const terms =
                this.normalizeArray(
                    analysis.terms
                );


            // =====================================================
            // 1. TEMPLATE PRINCIPAL
            // =====================================================

            const templateResult =
                await client.query(

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

                        sourceDocumentPath ||
                            null,

                        JSON.stringify(
                            analysis
                        )

                    ]

                );


            const template =
                templateResult.rows[0];


            // =====================================================
            // 2. CHAMPS DU TEMPLATE
            // =====================================================

            const registeredFields =
                new Set();


            for (
                const field
                of fields
            ) {

                if (
                    !field ||
                    !field.code
                ) {

                    continue;

                }


                const code =
                    String(
                        field.code
                    ).trim();


                if (
                    !code ||
                    registeredFields.has(code)
                ) {

                    continue;

                }


                registeredFields.add(
                    code
                );


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

                        code,

                        field.label ||
                            code,

                        field.data_type ||
                            "string",

                        field.source ||
                            null,

                        field.required === true,

                        // IMPORTANT :
                        // On ne met PAS la valeur
                        // détectée comme défaut.
                        //
                        // La valeur originale reste
                        // dans document_templates.definition
                        //
                        JSON.stringify(
                            null
                        ),

                        field.confidence ??
                            null

                    ]

                );

            }


            // =====================================================
            // 3. CLAUSES
            // =====================================================

            for (
                let index = 0;
                index < clauses.length;
                index++
            ) {

                const clause =
                    clauses[index];


                if (
                    !clause ||
                    !clause.code
                ) {

                    continue;

                }


                const content =
                    clause.content ||
                    "";


                // -------------------------------------------------
                // Variables réelles de la clause
                // -------------------------------------------------

                const variables =
                    this.normalizeVariables(
                        clause
                    );


                // -------------------------------------------------
                // Ordre
                // -------------------------------------------------

                const clauseOrder =
                    Number.isFinite(
                        Number(
                            clause.clause_order
                        )
                    )

                        ? Number(
                            clause.clause_order
                        )

                        : index + 1;


                // -------------------------------------------------
                // Enregistrement
                // -------------------------------------------------

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

                        String(
                            clause.code
                        ).trim(),

                        clause.title ||
                            clause.code,

                        content,

                        clauseOrder,

                        clause.enabled !== false,

                        JSON.stringify(
                            variables
                        )

                    ]

                );


                // =================================================
                // 4. VARIABLES NON ENCORE DÉCLARÉES
                // =================================================

                for (
                    const variable
                    of variables
                ) {

                    if (
                        registeredFields.has(
                            variable
                        )
                    ) {

                        continue;

                    }


                    registeredFields.add(
                        variable
                    );


                    // ---------------------------------------------
                    // Déterminer automatiquement le type
                    // ---------------------------------------------

                    let dataType =
                        "string";


                    if (
                        /(_date|date)$/i.test(
                            variable
                        )
                    ) {

                        dataType =
                            "date";

                    }

                    else if (
                        /(_amount|_rent|_deposit|_surface|_number|_rate|_months|_day)$/i.test(
                            variable
                        )
                    ) {

                        dataType =
                            "number";

                    }


                    // ---------------------------------------------
                    // Source générique
                    // ---------------------------------------------

                    let source =
                        `template_variable.${variable}`;


                    // ---------------------------------------------
                    // Sources métier connues
                    // ---------------------------------------------

                    const sourceMap = {

                        tenant_name:
                            "tenant.name",

                        tenant_phone:
                            "tenant.phone",

                        tenant_email:
                            "tenant.email",

                        tenant_identity_number:
                            "tenant.identity_number",

                        tenant_birth_date:
                            "tenant.birth_date",

                        tenant_birth_place:
                            "tenant.birth_place",

                        landlord_name:
                            "landlord.name",

                        landlord_address:
                            "landlord.address",

                        landlord_phone:
                            "landlord.phone",

                        landlord_email:
                            "landlord.email",

                        apartment_number:
                            "apartment.number",

                        apartment_level:
                            "apartment.level",

                        apartment_surface:
                            "apartment.surface",

                        building_name:
                            "building.name",

                        building_address:
                            "building.address",

                        building_city:
                            "building.city",

                        building_country:
                            "building.country",

                        lease_start_date:
                            "lease.start_date",

                        lease_end_date:
                            "lease.end_date",

                        lease_duration_months:
                            "lease.duration_months",

                        monthly_rent:
                            "lease.monthly_rent",

                        common_charges:
                            "lease.common_charges",

                        common_charges_amount:
                            "agency_terms.common_charges_amount",

                        monthly_total:
                            "lease.monthly_total",

                        deposit:
                            "lease.deposit",

                        payment_day:
                            "lease.payment_day",

                        payment_method:
                            "agency_terms.payment_method"

                    };


                    if (
                        sourceMap[variable]
                    ) {

                        source =
                            sourceMap[
                                variable
                            ];

                    }


                    // ---------------------------------------------
                    // Label lisible
                    // ---------------------------------------------

                    const label =
                        variable
                            .replace(
                                /_/g,
                                " "
                            )
                            .replace(
                                /\b\w/g,
                                char =>
                                    char.toUpperCase()
                            );


                    // ---------------------------------------------
                    // Ajouter le champ
                    // ---------------------------------------------

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
                            false,
                            $6::jsonb,
                            $7
                        )
                        `,

                        [

                            template.id,

                            variable,

                            label,

                            dataType,

                            source,

                            JSON.stringify(
                                null
                            ),

                            null

                        ]

                    );

                }

            }


            // =====================================================
            // 5. TERMES PROPRES À L'AGENCE
            // =====================================================

            for (
                const term
                of terms
            ) {

                if (
                    !term ||
                    !term.code
                ) {

                    continue;

                }


                const code =
                    String(
                        term.code
                    ).trim();


                if (!code) {

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

                        code,

                        term.label ||
                            code,

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


            // =====================================================
            // 6. METTRE À JOUR LA DÉFINITION
            // =====================================================

            const normalizedAnalysis = {

                ...analysis,

                fields,

                clauses,

                terms,

                template_metadata: {

                    generated_at:
                        new Date().toISOString(),

                    field_count:
                        registeredFields.size,

                    clause_count:
                        clauses.length,

                    term_count:
                        terms.length,

                    status:
                        "DRAFT"

                }

            };


            await client.query(

                `
                UPDATE marega.document_templates

                SET

                    definition = $1::jsonb,

                    updated_at = NOW()

                WHERE id = $2

                `,

                [

                    JSON.stringify(
                        normalizedAnalysis
                    ),

                    template.id

                ]

            );


            // =====================================================
            // COMMIT
            // =====================================================

            await client.query(
                "COMMIT"
            );


            // =====================================================
            // RÉSULTAT
            // =====================================================

            return {

                template,

                field_count:
                    registeredFields.size,

                term_count:
                    terms.length,

                clause_count:
                    clauses.length

            };


        }

        catch (error) {

            await client.query(
                "ROLLBACK"
            );

            throw error;

        }

        finally {

            client.release();

        }

    }

}


module.exports =
    DocumentTemplateService;