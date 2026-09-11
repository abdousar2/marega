class TemplateNormalizerService {

    // =========================================================
    // NORMALISATION GLOBALE
    // =========================================================

    static normalize(analysis) {

        if (!analysis) {
            throw new Error("Analyse du document manquante.");
        }

        const documentType =
            analysis.document_type || "UNKNOWN";

        const fields =
            Array.isArray(analysis.fields)
                ? analysis.fields
                : [];

        const terms =
            Array.isArray(analysis.terms)
                ? analysis.terms
                : [];

        const clauses =
            Array.isArray(analysis.clauses)
                ? analysis.clauses
                : [];

        return {

            document_type: documentType,

            fields:
                this.normalizeFields(fields),

            terms:
                this.normalizeTerms(terms),

            clauses:
                this.normalizeClauses(
                    clauses,
                    fields
                ),

            metadata: {

                field_count:
                    fields.length,

                term_count:
                    terms.length,

                clause_count:
                    clauses.length,

                normalized_at:
                    new Date().toISOString()
            }
        };
    }


    // =========================================================
    // CHAMPS
    // =========================================================

    static normalizeFields(fields) {

        return fields.map(field => {

            const code =
                this.normalizeCode(
                    field.code
                );

            return {

                code,

                label:
                    field.label ||
                    code,

                data_type:
                    field.data_type ||
                    "string",

                source:
                    field.source ||
                    null,

                required:
                    Boolean(field.required),

                placeholder:
                    `{{${code}}}`,

                confidence:
                    this.normalizeConfidence(
                        field.confidence
                    )
            };
        });
    }


    // =========================================================
    // TERMES
    // =========================================================

    static normalizeTerms(terms) {

        return terms.map(term => {

            const code =
                this.normalizeCode(
                    term.code
                );

            return {

                code,

                label:
                    term.label ||
                    code,

                value_type:
                    term.value_type ||
                    "string",

                default_value:
                    term.default_value ??
                    null,

                description:
                    term.description ||
                    null,

                placeholder:
                    `{{${code}}}`,

                confidence:
                    this.normalizeConfidence(
                        term.confidence
                    )
            };
        });
    }


    // =========================================================
    // CLAUSES
    // =========================================================

    static normalizeClauses(
        clauses,
        fields
    ) {

        return clauses.map(clause => {

            let content =
                clause.content ||
                "";

            // -------------------------------------------------
            // Remplacement des valeurs détectées
            // par leurs placeholders
            // -------------------------------------------------

            content =
                this.replaceFieldValues(
                    content,
                    fields
                );

            // -------------------------------------------------
            // Nettoyage spécifique
            // -------------------------------------------------

            content =
                this.cleanClauseContent(
                    content
                );

            // -------------------------------------------------
            // Détection des variables finales
            // -------------------------------------------------

            const variables =
                this.extractVariables(
                    content
                );

            return {

                code:
                    clause.code,

                title:
                    clause.title,

                content,

                clause_order:
                    clause.clause_order,

                enabled:
                    clause.enabled !== false,

                variables,

                confidence:
                    this.normalizeConfidence(
                        clause.confidence
                    )
            };
        });
    }


    // =========================================================
    // REMPLACEMENT DES VALEURS
    // =========================================================

    static replaceFieldValues(content, fields) {

        let result = String(content || "");

        const usableFields = fields
            .filter(field =>
                field.value !== null &&
                field.value !== undefined &&
                String(field.value).trim() !== ""
            )
            .sort((a, b) =>
                String(b.value).length -
                String(a.value).length
            );

        for (const field of usableFields) {

            const value =
                String(field.value).trim();

            if (!value) {
                continue;
            }

            const placeholder =
                `{{${field.code}}}`;

            // =====================================================
            // VALEURS NUMÉRIQUES
            // =====================================================

            if (
                field.data_type === "number" ||
                /^[0-9][0-9\s.,]*$/.test(value)
            ) {

                const escaped =
                    value.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

                /*
                * IMPORTANT :
                * On ne remplace jamais un nombre
                * lorsqu'il fait partie d'un autre nombre.
                *
                * Exemple :
                *
                * 5 ne doit PAS toucher :
                * 95
                * 123456
                * 2026
                *
                * Mais doit pouvoir toucher :
                * "le 5 de chaque mois"
                */

                const numericRegex =
                    new RegExp(
                        `(?<![0-9])${escaped}(?![0-9])`,
                        "g"
                    );

                result =
                    result.replace(
                        numericRegex,
                        placeholder
                    );

                continue;
            }

            // =====================================================
            // DATES
            // =====================================================

            if (field.data_type === "date") {

                const escaped =
                    value.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

                const dateRegex =
                    new RegExp(
                        escaped,
                        "gi"
                    );

                result =
                    result.replace(
                        dateRegex,
                        placeholder
                    );

                continue;
            }

            // =====================================================
            // TEXTE
            // =====================================================

            const escaped =
                value.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            const textRegex =
                new RegExp(
                    escaped,
                    "gi"
                );

            result =
                result.replace(
                    textRegex,
                    placeholder
                );
        }

        return result;
    }

    // =========================================================
    // NETTOYAGE DES CLAUSES
    // =========================================================

    static cleanClauseContent(content) {

        let result =
            String(content);

        // -------------------------------------------------
        // Supprimer les pieds de page éventuels
        // -------------------------------------------------

        result =
            result.replace(
                /--\s*\d+\s+(?:of|sur)\s+\d+\s*--/gi,
                ""
            );

        // -------------------------------------------------
        // Supprimer la partie de simulation finale
        // -------------------------------------------------

        result =
            result.replace(
                /\s*DOCUMENT\s+DE\s+SIMULATION[\s\S]*$/i,
                ""
            );

        // -------------------------------------------------
        // Supprimer la zone de signatures finale
        // -------------------------------------------------

        result =
            result.replace(
                /\s*Fait\s+à\s+[^.]+,\s+le\s+[^.]+\.\s*[\s\S]*$/i,
                ""
            );

        // -------------------------------------------------
        // Espaces
        // -------------------------------------------------

        result =
            result
                .replace(/\s+/g, " ")
                .trim();

        return result;
    }


    // =========================================================
    // VARIABLES
    // =========================================================

    static extractVariables(text) {

        const variables = [];

        const regex =
            /\{\{([^}]+)\}\}/g;

        let match;

        while (
            (match = regex.exec(text)) !== null
        ) {

            const variable =
                String(match[1])
                    .trim();

            if (
                variable &&
                !variables.includes(variable)
            ) {

                variables.push(
                    variable
                );
            }
        }

        return variables;
    }


    // =========================================================
    // NORMALISATION DU CODE
    // =========================================================

    static normalizeCode(code) {

        return String(code || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z0-9_]+/g,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                "");
    }


    // =========================================================
    // CONFIDENCE
    // =========================================================

    static normalizeConfidence(
        confidence
    ) {

        const value =
            Number(confidence);

        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(
            0,
            Math.min(
                1,
                value
            )
        );
    }
}


module.exports =
    TemplateNormalizerService;