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
    // RÉCUPÉRER LES CHAMPS DU TEMPLATE
    // =========================================================

    static async getFields(templateId) {

        const result = await pool.query(
            `
            SELECT
                id,
                template_id,
                code,
                label,
                data_type,
                source,
                required,
                default_value,
                confidence
            FROM marega.template_fields
            WHERE template_id = $1
            ORDER BY id ASC
            `,
            [
                templateId
            ]
        );

        return result.rows;
    }


    // =========================================================
    // RÉCUPÉRER LES CLAUSES
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
    // RÉCUPÉRER LES TERMES SPÉCIFIQUES DU BAIL
    // =========================================================

    static async getLeaseTerms(
        leaseId,
        agencyId
    ) {

        const result = await pool.query(
            `
            SELECT
                lt.id,
                lt.lease_id,
                lt.agency_term_id,
                lt.value,
                at.code,
                at.label,
                at.value_type,
                at.default_value
            FROM marega.lease_terms lt
            INNER JOIN marega.agency_terms at
                ON at.id = lt.agency_term_id
            AND at.agency_id = $2
            WHERE lt.lease_id = $1
            ORDER BY lt.id ASC
            `,
            [
                leaseId,
                agencyId
            ]
        );

        return result.rows;
    }


    // =========================================================
    // NORMALISER UNE VALEUR
    // =========================================================

    static normalizeValue(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (typeof value === "object") {
            return JSON.stringify(value);
        }

        return String(value);
    }


    // =========================================================
    // FORMATER UNE DATE
    // =========================================================

    static formatDate(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return new Intl.DateTimeFormat(
            "fr-FR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);
    }


    // =========================================================
    // FORMATER UN MONTANT
    // =========================================================

    static formatMoney(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {
            return String(value);
        }

        return new Intl.NumberFormat(
            "fr-FR",
            {
                maximumFractionDigits: 0
            }
        )
            .format(number)
            .replace(/\u00A0/g, " ");
    }


    // =========================================================
    // FORMATER UNE VALEUR SELON LA VARIABLE
    // =========================================================

    static formatVariableValue(
        variable,
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }


        // -----------------------------------------------------
        // DATES
        // -----------------------------------------------------

        const dateVariables = [

            "tenant_birth_date",

            "lease_start_date",

            "lease_end_date",

            "date",

            "birth_date",

            "start_date",

            "end_date"

        ];

        if (
            dateVariables.includes(variable)
        ) {

            return this.formatDate(value);
        }


        // -----------------------------------------------------
        // MONTANTS
        // -----------------------------------------------------

        const moneyVariables = [

            "monthly_rent",

            "common_charges",

            "monthly_total",

            "deposit",

            "common_charges_amount"

        ];

        if (
            moneyVariables.includes(variable)
        ) {

            return this.formatMoney(value);
        }


        // -----------------------------------------------------
        // BOOLÉENS
        // -----------------------------------------------------

        if (
            variable === "individual_meters" ||
            variable === "electricity_paid_by_tenant" ||
            variable === "water_billed_by_meter"
        ) {

            return value
                ? "Oui"
                : "Non";
        }


        // -----------------------------------------------------
        // AUTRES
        // -----------------------------------------------------

        return this.normalizeValue(
            value
        );
    }


    // =========================================================
    // RÉCUPÉRER UNE VALEUR DANS LE CONTEXTE
    // =========================================================

    static getContextValue(
        context,
        variable
    ) {

        if (
            !context ||
            !variable
        ) {
            return undefined;
        }

        const parts =
            String(variable)
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
                    value === null ||
                    value === ""
                ) {

                    return keepUnknown
                        ? fullMatch
                        : "";
                }

                return this.formatVariableValue(
                    variable,
                    value
                );
            }
        );
    }


    // =========================================================
    // CONSTRUIRE LE CONTEXTE DU BAIL
    // =========================================================

    static async buildLeaseContext(
        lease,
        agencyTerms = [],
        templateFields = [],
        leaseTerms = []
    ) {

        if (!lease) {

            throw new Error(
                "Données du bail manquantes."
            );
        }


        // =====================================================
        // TERMES AGENCE
        // =====================================================

        const agencyTermMap = {};

        for (const term of agencyTerms) {

            if (!term || !term.code) {
                continue;
            }

            let value =
                term.default_value;

            if (
                value &&
                typeof value === "object" &&
                !Array.isArray(value) &&
                Object.prototype.hasOwnProperty.call(
                    value,
                    "value"
                )
            ) {

                value =
                    value.value;
            }

            agencyTermMap[term.code] =
                value;
        }


        // =====================================================
        // TERMES DU BAIL
        // =====================================================

        const leaseTermMap = {};

        for (const term of leaseTerms) {

            if (!term || !term.code) {
                continue;
            }

            let value =
                term.value;

            if (
                value &&
                typeof value === "object" &&
                !Array.isArray(value) &&
                Object.prototype.hasOwnProperty.call(
                    value,
                    "value"
                )
            ) {

                value =
                    value.value;
            }

            leaseTermMap[term.code] =
                value;
        }


        // =====================================================
        // VALEURS PAR DÉFAUT DU TEMPLATE
        // =====================================================

        const templateDefaultMap = {};

        for (const field of templateFields) {

            if (!field || !field.code) {
                continue;
            }

            if (
                field.default_value !== null &&
                field.default_value !== undefined
            ) {

                let value =
                    field.default_value;

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    Object.prototype.hasOwnProperty.call(
                        value,
                        "value"
                    )
                ) {

                    value =
                        value.value;
                }

                templateDefaultMap[field.code] =
                    value;
            }
        }


        // =====================================================
        // LOYER
        // =====================================================

        const monthlyRent =
            Number(
                lease.monthly_rent || 0
            );


        // =====================================================
        // CHARGES COMMUNES
        //
        // Priorité :
        // 1. charge réelle du bail si > 0
        // 2. terme du bail
        // 3. terme agence
        // =====================================================

        let commonCharges =
            Number(
                lease.common_charges
            );

        if (
            !Number.isFinite(commonCharges) ||
            commonCharges <= 0
        ) {

            if (
                leaseTermMap.common_charges_amount !==
                undefined
            ) {

                commonCharges =
                    Number(
                        leaseTermMap.common_charges_amount
                    );

            } else if (
                agencyTermMap.common_charges_amount !==
                undefined
            ) {

                commonCharges =
                    Number(
                        agencyTermMap.common_charges_amount
                    );

            } else {

                commonCharges = 0;
            }
        }


        if (!Number.isFinite(commonCharges)) {
            commonCharges = 0;
        }


        // =====================================================
        // TOTAL MENSUEL
        // =====================================================

        const monthlyTotal =
            monthlyRent +
            commonCharges;


        // =====================================================
        // LOCATAIRE
        // =====================================================

        const tenantName =
            String(
                lease.tenant_name ||
                [
                    lease.tenant_first_name,
                    lease.tenant_last_name
                ]
                    .filter(Boolean)
                    .join(" ")
            ).trim();


        // =====================================================
        // BAILLEUR
        // =====================================================

        const landlordName =
            String(
                lease.landlord_name ||
                [
                    lease.landlord_first_name,
                    lease.landlord_last_name
                ]
                    .filter(Boolean)
                    .join(" ")
            ).trim();


        // =====================================================
        // VILLE / PAYS
        //
        // Si l'immeuble n'en possède pas :
        // on prend ceux de l'agence.
        // =====================================================

        const buildingCity =
            lease.building_city ||
            lease.agency_city ||
            "";

        const buildingCountry =
            lease.building_country ||
            lease.agency_country ||
            "";


        // =====================================================
        // MODE DE PAIEMENT
        // =====================================================

        const paymentMethod =
            lease.payment_method ||
            leaseTermMap.payment_method ||
            agencyTermMap.payment_method ||
            templateDefaultMap.payment_method ||
            null;


        // =====================================================
        // COMPTEURS
        //
        // On utilise uniquement une vraie valeur du bail.
        // Jamais les valeurs du contrat de simulation.
        // =====================================================

        const electricityMeter =
            lease.electricity_meter_number ||
            lease.electricity_meter ||
            leaseTermMap.electricity_meter_number ||
            null;

        const waterMeter =
            lease.water_meter_number ||
            lease.water_meter ||
            leaseTermMap.water_meter_number ||
            null;


        // =====================================================
        // CONTEXTE
        // =====================================================

        const context = {

            // -------------------------------------------------
            // BAIL
            // -------------------------------------------------

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
                    monthlyRent,

                common_charges:
                    commonCharges,

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


            // -------------------------------------------------
            // LOCATAIRE
            // -------------------------------------------------

            tenant: {

                id:
                    lease.tenant_id,

                name:
                    tenantName,

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

                birth_date:
                    lease.tenant_birth_date,

                birth_place:
                    lease.tenant_birth_place,

                identity_number:
                    lease.identity_number ||
                    lease.tenant_identity_number
            },


            // -------------------------------------------------
            // BAILLEUR
            // -------------------------------------------------

            landlord: {

                id:
                    lease.landlord_id,

                name:
                    landlordName,

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


            // -------------------------------------------------
            // APPARTEMENT
            // -------------------------------------------------

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


            // -------------------------------------------------
            // IMMEUBLE
            // -------------------------------------------------

            building: {

                id:
                    lease.building_id,

                name:
                    lease.building_name,

                address:
                    lease.building_address,

                city:
                    buildingCity,

                country:
                    buildingCountry
            },


            // -------------------------------------------------
            // AGENCE
            // -------------------------------------------------

            agency: {

                id:
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


            // -------------------------------------------------
            // TERMES
            // -------------------------------------------------

            terms: {}
        };


        // =====================================================
        // ALIAS LOCATAIRE
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

        context.tenant_birth_date =
            context.tenant.birth_date;

        context.tenant_birth_place =
            context.tenant.birth_place;

        context.tenant_identity_number =
            context.tenant.identity_number;


        // =====================================================
        // ALIAS BAILLEUR
        // =====================================================

        context.landlord_name =
            context.landlord.name;

        context.landlord_first_name =
            context.landlord.first_name;

        context.landlord_last_name =
            context.landlord.last_name;

        context.landlord_company_name =
            context.landlord.company_name;

        context.landlord_phone =
            context.landlord.phone;

        context.landlord_email =
            context.landlord.email;

        context.landlord_address =
            context.landlord.address;

        context.landlord_identity_number =
            context.landlord.identity_number;


        // =====================================================
        // ALIAS APPARTEMENT
        // =====================================================

        context.apartment_number =
            context.apartment.number;

        context.apartment_type =
            context.apartment.type;

        context.apartment_surface =
            context.apartment.surface;

        context.apartment_level =
            context.apartment.level;


        // =====================================================
        // ALIAS IMMEUBLE
        // =====================================================

        context.building_name =
            context.building.name;

        context.building_address =
            context.building.address;

        context.building_city =
            context.building.city;

        context.building_country =
            context.building.country;


        // =====================================================
        // VALEURS PRINCIPALES
        // =====================================================

        context.monthly_rent =
            monthlyRent;

        context.common_charges =
            commonCharges;

        context.monthly_total =
            monthlyTotal;

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
            paymentMethod;


        // =====================================================
        // COMPTEURS
        // =====================================================

        context.electricity_meter_number =
            electricityMeter;

        context.water_meter_number =
            waterMeter;


        // =====================================================
        // TERMES AGENCE
        // Puis TERMES DU BAIL
        //
        // Le terme du bail est prioritaire.
        // =====================================================

        for (const term of agencyTerms) {

            if (!term || !term.code) {
                continue;
            }

            context.terms[
                term.code
            ] =
                agencyTermMap[term.code];

            context[
                term.code
            ] =
                agencyTermMap[term.code];
        }


        for (const term of leaseTerms) {

            if (!term || !term.code) {
                continue;
            }

            context.terms[
                term.code
            ] =
                leaseTermMap[term.code];

            context[
                term.code
            ] =
                leaseTermMap[term.code];
        }


        // =====================================================
        // VALEURS CALCULÉES
        // =====================================================

        context.common_charges_amount =
            leaseTermMap.common_charges_amount ??
            agencyTermMap.common_charges_amount ??
            commonCharges;


        context.individual_meters =
            leaseTermMap.individual_meters ??
            agencyTermMap.individual_meters ??
            false;


        return context;
    }


    // =========================================================
    // CALCUL DURÉE DU BAIL
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
            (match = regex.exec(text)) !== null
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
                        this.extractVariables(
                            content
                        )

                };
            }
        );
    }


    // =========================================================
    // VARIABLES MANQUANTES
    //
    // IMPORTANT :
    // seules les variables marquées required=true
    // dans template_fields bloquent le rendu.
    // =========================================================

    static findMissingVariables(
        clauses,
        context,
        fields = []
    ) {

        const missing =
            new Set();


        // =====================================================
        // VARIABLES OBLIGATOIRES DU TEMPLATE
        // =====================================================

        const requiredFields =
            fields.filter(
                field =>
                    field.required === true
            );


        for (
            const field
            of requiredFields
        ) {

            const value =
                this.getContextValue(
                    context,
                    field.code
                );

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                missing.add(
                    field.code
                );
            }
        }


        return Array.from(
            missing
        );
    }


    // =========================================================
    // RENDRE UN TEMPLATE POUR UN BAIL
    // =========================================================

    static async renderByLease({
        templateId,
        leaseId,
        agencyId
    }) {

        // =====================================================
        // VALIDATION
        // =====================================================

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
        // 2. CHAMPS
        // =====================================================

        const fields =
            await this.getFields(
                template.id
            );


        // =====================================================
        // 3. BAIL COMPLET
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
        // 4. CLAUSES
        // =====================================================

        const clauses =
            await this.getClauses(
                template.id
            );


        // =====================================================
        // 5. TERMES AGENCE
        // =====================================================

        const agencyTerms =
            await this.getAgencyTerms(
                agencyId
            );


        // =====================================================
        // 6. TERMES DU BAIL
        // =====================================================

        const leaseTerms =
            await this.getLeaseTerms(
                leaseId,
                agencyId
            );


        // =====================================================
        // 7. CONTEXTE
        // =====================================================

        const context =
            await this.buildLeaseContext(
                lease,
                agencyTerms,
                fields,
                leaseTerms
            );


        // =====================================================
        // 8. VARIABLES OBLIGATOIRES MANQUANTES
        // =====================================================

        const missingVariables =
            this.findMissingVariables(
                clauses,
                context,
                fields
            );


        // =====================================================
        // 9. RENDU
        // =====================================================

        const renderedClauses =
            this.renderClauses(
                clauses,
                context
            );


        // =====================================================
        // 10. RÉSULTAT
        // =====================================================

        return {

            // =====================================================
            // TEMPLATE COMPLET
            // =====================================================

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
                    template.status,

                // IMPORTANT :
                // conserver la définition complète
                definition:
                    template.definition || null
            },


            // =====================================================
            // LAYOUT
            // =====================================================

            layout:
                template.definition?.layout ||
                null,


            // =====================================================
            // TEXTE SOURCE PARAMÉTRÉ
            // =====================================================

            source_text:
                template.definition?.source_text ||
                null,


            // =====================================================
            // BAIL
            // =====================================================

            lease: {

                id:
                    lease.id,

                contract_number:
                    lease.contract_number
            },


            // =====================================================
            // CONTEXTE
            // =====================================================

            context,


            // =====================================================
            // VARIABLES MANQUANTES
            // =====================================================

            missing_variables:
                missingVariables,


            // =====================================================
            // ÉTAT
            // =====================================================

            ready:
                missingVariables.length === 0,


            // =====================================================
            // CLAUSES
            // =====================================================

            clauses:
                renderedClauses
        };
    }
}


module.exports =
    TemplateRendererService;