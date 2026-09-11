const pool = require("../config/database");
const Lease = require("../models/lease.model");

class TemplateRendererService {

    // =========================================================
    // RÉCUPÉRER LE TEMPLATE
    // =========================================================

    static async getTemplate(templateId, agencyId) {

        const result = await pool.query(
            `
            SELECT
                id,
                agency_id,
                document_type,
                name,
                version,
                status,
                source_document_path,
                definition,
                created_at,
                updated_at
            FROM marega.document_templates
            WHERE id = $1
              AND agency_id = $2
            LIMIT 1
            `,
            [
                templateId,
                agencyId
            ]
        );

        if (result.rows.length === 0) {

            throw new Error(
                `Template introuvable : ${templateId}`
            );

        }

        return result.rows[0];
    }


    // =========================================================
    // RÉCUPÉRER LES CLAUSES DU TEMPLATE
    // =========================================================

    static async getClauses(templateId) {

        const result = await pool.query(
            `
            SELECT
                id,
                template_id,
                code,
                title,
                content,
                clause_order,
                enabled,
                variables
            FROM marega.template_clauses
            WHERE template_id = $1
              AND enabled = true
            ORDER BY clause_order ASC, id ASC
            `,
            [
                templateId
            ]
        );

        return result.rows;
    }


    // =========================================================
    // RÉCUPÉRER LES TERMES DE L'AGENCE
    // =========================================================

    static async getAgencyTerms(agencyId) {

        const result = await pool.query(
            `
            SELECT
                id,
                agency_id,
                code,
                label,
                value_type,
                default_value,
                description,
                source_template_id
            FROM marega.agency_terms
            WHERE agency_id = $1
            ORDER BY id ASC
            `,
            [
                agencyId
            ]
        );

        return result.rows;
    }


    // =========================================================
    // CONVERTIR UNE VALEUR JSONB
    // =========================================================

    static normalizeValue(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        // PostgreSQL JSONB peut retourner directement
        // un objet / tableau JavaScript.

        if (
            typeof value === "object"
        ) {

            if (Array.isArray(value)) {

                return value.join(", ");

            }

            return JSON.stringify(value);

        }

        return String(value);
    }


    // =========================================================
    // FORMATER UNE VALEUR
    // =========================================================

    static formatValue(value, dataType = "string") {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        switch (dataType) {

            case "number":

                return Number(value)
                    .toLocaleString("fr-FR")
                    .replace(/\u00A0/g, " ");


            case "boolean":

                return value
                    ? "Oui"
                    : "Non";


            case "date":

                return String(value);


            default:

                return String(value);

        }
    }


    // =========================================================
    // REMPLACER LES VARIABLES
    // =========================================================

    static renderText(
        text = "",
        context = {},
        options = {}
    ) {

        const {
            keepUnknown = false
        } = options;

        if (!text) {
            return "";
        }

        return text.replace(
            /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
            (
                fullMatch,
                variable
            ) => {

                const value =
                    this.getContextValue(
                        context,
                        variable
                    );

                if (
                    value === undefined ||
                    value === null
                ) {

                    return keepUnknown
                        ? fullMatch
                        : "";

                }

                return this.normalizeValue(
                    value
                );
            }
        );
    }


    // =========================================================
    // RÉCUPÉRER UNE VALEUR DANS LE CONTEXTE
    // =========================================================

    static getContextValue(
        context,
        path
    ) {

        if (
            !context ||
            !path
        ) {
            return undefined;
        }

        // Exemple :
        //
        // tenant.name
        //
        // devient :
        //
        // context.tenant.name

        const parts =
            String(path)
                .split(".");

        let current =
            context;

        for (
            const part
            of parts
        ) {

            if (
                current === null ||
                current === undefined
            ) {

                return undefined;

            }

            current =
                current[part];

        }

        return current;
    }


    // =========================================================
    // CONSTRUIRE LE CONTEXTE À PARTIR DU BAIL
    // =========================================================

    static async buildLeaseContext(
        lease,
        agencyTerms = []
    ) {

        if (!lease) {

            throw new Error(
                "Données du bail manquantes."
            );

        }

        const context = {

            // =================================================
            // BAIL
            // =================================================

            lease: {

                id:
                    lease.id,

                contract_number:
                    lease.contract_number,

                start_date:
                    lease.start_date,

                end_date:
                    lease.end_date,

                monthly_rent:
                    lease.monthly_rent,

                common_charges:
                    lease.common_charges,

                deposit:
                    lease.deposit,

                payment_day:
                    lease.payment_day,

                status:
                    lease.status,

                notes:
                    lease.notes,

                identity_number:
                    lease.identity_number,

                level:
                    lease.level

            },


            // =================================================
            // LOCATAIRE
            // =================================================

            tenant: {

                id:
                    lease.tenant_id,

                name:
                    lease.tenant_name ||
                    [
                        lease.tenant_first_name,
                        lease.tenant_last_name
                    ]
                        .filter(Boolean)
                        .join(" "),

                first_name:
                    lease.tenant_first_name,

                last_name:
                    lease.tenant_last_name,

                phone:
                    lease.tenant_phone,

                email:
                    lease.tenant_email,

                profession:
                    lease.tenant_profession,

                identity_number:
                    lease.identity_number ||
                    lease.tenant_identity_number

            },


            // =================================================
            // BAILLEUR
            // =================================================

            landlord: {

                id:
                    lease.landlord_id,

                name:
                    lease.landlord_name ||
                    [
                        lease.landlord_first_name,
                        lease.landlord_last_name
                    ]
                        .filter(Boolean)
                        .join(" "),

                first_name:
                    lease.landlord_first_name,

                last_name:
                    lease.landlord_last_name,

                company_name:
                    lease.landlord_company_name,

                phone:
                    lease.landlord_phone,

                email:
                    lease.landlord_email,

                address:
                    lease.landlord_address,

                identity_number:
                    lease.landlord_identity_number

            },


            // =================================================
            // APPARTEMENT
            // =================================================

            apartment: {

                id:
                    lease.apartment_id,

                number:
                    lease.apartment_number,

                type:
                    lease.apartment_type,

                surface:
                    lease.apartment_surface,

                rent:
                    lease.apartment_rent,

                deposit:
                    lease.apartment_deposit,

                level:
                    lease.level

            },


            // =================================================
            // IMMEUBLE
            // =================================================

            building: {

                id:
                    lease.building_id,

                name:
                    lease.building_name,

                address:
                    lease.building_address,

                city:
                    lease.building_city,

                country:
                    lease.building_country

            },


            // =================================================
            // AGENCE
            // =================================================

            agency: {

                id:
                    lease.agency_id ||
                    lease.agency_id,

                name:
                    lease.agency_name,

                type:
                    lease.agency_type,

                address:
                    lease.agency_address,

                city:
                    lease.agency_city,

                country:
                    lease.agency_country,

                phone:
                    lease.agency_phone,

                email:
                    lease.agency_email,

                ninea:
                    lease.agency_ninea,

                rccm:
                    lease.agency_rccm,

                logo_path:
                    lease.agency_logo_path

            },

            // =================================================
            // TERMES DE L'AGENCE
            // =================================================

            terms: {}

        };


        // =====================================================
        // CALCULS
        // =====================================================

        const monthlyRent =
            Number(
                lease.monthly_rent || 0
            );

        const commonCharges =
            Number(
                lease.common_charges || 0
            );

        context.monthly_total =
            monthlyRent +
            commonCharges;


        // =====================================================
        // ALIASES DIRECTS
        //
        // Permet aux templates d'utiliser :
        //
        // {{tenant_name}}
        //
        // au lieu de :
        //
        // {{tenant.name}}
        // =====================================================

        context.tenant_name =
            context.tenant.name;

        context.tenant_first_name =
            context.tenant.first_name;

        context.tenant_last_name =
            context.tenant.last_name;

        context.tenant_phone =
            context.tenant.phone;

        context.tenant_email =
            context.tenant.email;

        context.tenant_profession =
            context.tenant.profession;

        context.tenant_identity_number =
            context.tenant.identity_number;


        context.landlord_name =
            context.landlord.name;

        context.landlord_first_name =
            context.landlord.first_name;

        context.landlord_last_name =
            context.landlord.last_name;

        context.landlord_phone =
            context.landlord.phone;

        context.landlord_email =
            context.landlord.email;

        context.landlord_address =
            context.landlord.address;

        context.landlord_identity_number =
            context.landlord.identity_number;


        context.apartment_number =
            context.apartment.number;

        context.apartment_type =
            context.apartment.type;

        context.apartment_surface =
            context.apartment.surface;

        context.apartment_level =
            context.apartment.level;


        context.building_name =
            context.building.name;

        context.building_address =
            context.building.address;

        context.building_city =
            context.building.city;

        context.building_country =
            context.building.country;


        context.monthly_rent =
            monthlyRent;

        context.common_charges =
            commonCharges;

        context.monthly_total =
            context.monthly_total;

        context.deposit =
            lease.deposit;

        context.payment_day =
            lease.payment_day;

        context.lease_duration_months =
            this.calculateDurationMonths(
                lease.start_date,
                lease.end_date
            );

        context.lease_start_date =
            lease.start_date;

        context.lease_end_date =
            lease.end_date;

        context.payment_method =
            null;


        // =====================================================
        // TERMES DE L'AGENCE
        // =====================================================

        for (
            const term
            of agencyTerms
        ) {

            if (!term.code) {
                continue;
            }

            let value =
                term.default_value;

            // JSONB PostgreSQL peut être null
            // ou déjà désérialisé.

            if (
                value !== null &&
                value !== undefined
            ) {

                if (
                    typeof value === "object" &&
                    value !== null &&
                    Object.prototype.hasOwnProperty.call(
                        value,
                        "value"
                    )
                ) {

                    value =
                        value.value;

                }

            }

            context.terms[
                term.code
            ] = value;

            // Alias direct :
            //
            // {{common_charges_amount}}
            //
            // {{sublease_policy}}

            context[
                term.code
            ] = value;

        }


        return context;
    }


    // =========================================================
    // CALCUL DURÉE
    // =========================================================

    static calculateDurationMonths(
        startDate,
        endDate
    ) {

        if (
            !startDate ||
            !endDate
        ) {

            return null;

        }

        const start =
            new Date(startDate);

        const end =
            new Date(endDate);

        if (
            Number.isNaN(
                start.getTime()
            ) ||
            Number.isNaN(
                end.getTime()
            )
        ) {

            return null;

        }

        return (
            (end.getFullYear() -
                start.getFullYear()) *
                12
        ) +
        (
            end.getMonth() -
            start.getMonth()
        ) + 1;
    }


    // =========================================================
    // RENDRE LES CLAUSES
    // =========================================================

    static renderClauses(
        clauses,
        context
    ) {

        return clauses.map(
            clause => {

                const content =
                    this.renderText(
                        clause.content,
                        context,
                        {
                            keepUnknown: true
                        }
                    );

                return {

                    id:
                        clause.id,

                    code:
                        clause.code,

                    title:
                        clause.title,

                    content,

                    clause_order:
                        clause.clause_order,

                    enabled:
                        clause.enabled,

                    variables:
                        clause.variables || []

                };

            }
        );
    }


    // =========================================================
    // VÉRIFIER LES VARIABLES MANQUANTES
    // =========================================================

    static findMissingVariables(
        clauses,
        context
    ) {

        const missing =
            new Set();

        for (
            const clause
            of clauses
        ) {

            const variables =
                this.extractVariables(
                    clause.content
                );

            for (
                const variable
                of variables
            ) {

                const value =
                    this.getContextValue(
                        context,
                        variable
                    );

                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {

                    missing.add(
                        variable
                    );

                }

            }

        }

        return Array.from(
            missing
        );
    }


    // =========================================================
    // EXTRAIRE LES VARIABLES
    // =========================================================

    static extractVariables(
        text = ""
    ) {

        const variables = [];

        const regex =
            /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

        let match;

        while (
            (match = regex.exec(text))
            !== null
        ) {

            const variable =
                match[1];

            if (
                !variables.includes(
                    variable
                )
            ) {

                variables.push(
                    variable
                );

            }

        }

        return variables;
    }


    // =========================================================
    // RENDRE UN TEMPLATE POUR UN BAIL
    // =========================================================

    static async renderByLease({
        templateId,
        leaseId,
        agencyId
    }) {

        if (!templateId) {

            throw new Error(
                "templateId est obligatoire."
            );

        }

        if (!leaseId) {

            throw new Error(
                "leaseId est obligatoire."
            );

        }

        if (!agencyId) {

            throw new Error(
                "agencyId est obligatoire."
            );

        }


        // =====================================================
        // 1. TEMPLATE
        // =====================================================

        const template =
            await this.getTemplate(
                templateId,
                agencyId
            );


        // =====================================================
        // 2. BAIL COMPLET
        // =====================================================

        const lease =
            await Lease.getCompleteById(
                leaseId,
                agencyId
            );

        if (!lease) {

            throw new Error(
                `Bail introuvable : ${leaseId}`
            );

        }


        // =====================================================
        // 3. CLAUSES
        // =====================================================

        const clauses =
            await this.getClauses(
                template.id
            );


        // =====================================================
        // 4. TERMES AGENCE
        // =====================================================

        const agencyTerms =
            await this.getAgencyTerms(
                agencyId
            );


        // =====================================================
        // 5. CONTEXTE
        // =====================================================

        const context =
            await this.buildLeaseContext(
                lease,
                agencyTerms
            );


        // =====================================================
        // 6. VARIABLES MANQUANTES
        // =====================================================

        const missingVariables =
            this.findMissingVariables(
                clauses,
                context
            );


        // =====================================================
        // 7. RENDU
        // =====================================================

        const renderedClauses =
            this.renderClauses(
                clauses,
                context
            );


        // =====================================================
        // RÉSULTAT
        // =====================================================

        return {

            template: {

                id:
                    template.id,

                name:
                    template.name,

                version:
                    template.version,

                document_type:
                    template.document_type,

                status:
                    template.status

            },

            lease: {

                id:
                    lease.id,

                contract_number:
                    lease.contract_number

            },

            context,

            missing_variables:
                missingVariables,

            ready:
                missingVariables.length === 0,

            clauses:
                renderedClauses

        };
    }
}


module.exports =
    TemplateRendererService;