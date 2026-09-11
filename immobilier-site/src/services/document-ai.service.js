const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

class DocumentAIService {

    // =========================================================
    // NORMALISATION
    // =========================================================

    static normalizeText(text = "") {

        return text
            .replace(/\r/g, "\n")
            .replace(/\u00A0/g, " ")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }


    static cleanValue(value) {

        if (value === null || value === undefined) {
            return null;
        }

        return String(value)
            .replace(/\s+/g, " ")
            .trim();
    }


    static normalizeSearchText(text = "") {

        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }


    // =========================================================
    // EXTRACTION PDF
    // =========================================================

    static async extractPDF(filePath) {

        if (!filePath) {
            throw new Error("Chemin du document manquant.");
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`Document introuvable : ${filePath}`);
        }

        const buffer = fs.readFileSync(filePath);

        let parser = null;

        try {

            parser = new PDFParse({
                data: buffer
            });

            const result = await parser.getText();

            const text = this.normalizeText(result.text || "");

            const meaningfulText = text
                .replace(/[-–—]?\s*\d+\s+of\s+\d+\s*[-–—]?/gi, "")
                .replace(/[-–—]?\s*\d+\s+sur\s+\d+\s*[-–—]?/gi, "")
                .replace(/\s+/g, " ")
                .trim();

            const hasMeaningfulText =
                meaningfulText.length >= 80 &&
                /[a-zA-ZÀ-ÿ]{3,}/.test(meaningfulText);

            return {
                text,
                pages: result.total || 0,
                hasText: hasMeaningfulText
            };

        } finally {

            if (parser) {
                await parser.destroy();
            }
        }
    }


    // =========================================================
    // TYPE DE DOCUMENT
    // =========================================================

    static detectDocumentType(text) {

        const normalized = this.normalizeSearchText(text);

        let contractScore = 0;
        let receiptScore = 0;
        let noticeScore = 0;


        // -------------------------
        // CONTRAT DE LOCATION
        // -------------------------

        const contractKeywords = [
            "contrat de bail",
            "contrat de location",
            "bail",
            "preneur",
            "bailleur",
            "locataire",
            "loyer",
            "caution",
            "duree du bail",
            "resiliation",
            "preavis"
        ];

        contractKeywords.forEach(keyword => {

            if (normalized.includes(keyword)) {
                contractScore++;
            }

        });


        // -------------------------
        // REÇU
        // -------------------------

        const receiptKeywords = [
            "recu",
            "quittance",
            "montant encaisse",
            "montant verse",
            "paiement",
            "locataire",
            "loyer du mois"
        ];

        receiptKeywords.forEach(keyword => {

            if (normalized.includes(keyword)) {
                receiptScore++;
            }

        });


        // -------------------------
        // AVIS / NOTIFICATION
        // -------------------------

        const noticeKeywords = [
            "mise en demeure",
            "avis",
            "notification",
            "sommation"
        ];

        noticeKeywords.forEach(keyword => {

            if (normalized.includes(keyword)) {
                noticeScore++;
            }

        });


        if (contractScore >= receiptScore && contractScore >= noticeScore && contractScore >= 2) {
            return "LEASE_CONTRACT";
        }

        if (receiptScore >= contractScore && receiptScore >= noticeScore && receiptScore >= 2) {
            return "RECEIPT";
        }

        if (noticeScore >= 2) {
            return "NOTICE";
        }

        return "UNKNOWN";
    }


    // =========================================================
    // UTILITAIRE : EXTRAIRE APRÈS UN MOTIF
    // =========================================================

    static extractAfter(text, regex, maxLength = 200) {

        const match = text.match(regex);

        if (!match) {
            return null;
        }

        return this.cleanValue(match[1]).substring(0, maxLength);
    }


    // =========================================================
    // DÉTECTION DES CHAMPS
    // =========================================================

    static detectFields(text) {

        const fields = [];


        // =====================================================
        // NUMÉRO DE CNI
        // =====================================================

        const identityMatch = text.match(
            /(?:CNI|carte\s+d['’]?identité|pi[eè]ce\s+d['’]?identité)\s*(?:n[°o]\.?\s*)?([0-9][0-9\s]{5,25})/i
        );

        if (identityMatch) {

            const identityNumber = identityMatch[1]
                .replace(/\s+/g, "")
                .trim();

            fields.push({
                code: "tenant_identity_number",
                label: "Numéro de pièce d'identité",
                data_type: "string",
                source: "tenant.identity_number",
                required: false,
                value: identityNumber,
                confidence: 0.97
            });
        }


        // =====================================================
        // NOM DU BAILLEUR
        // =====================================================

        const landlordMatch = text.match(
            /BAILLEUR\s+([^\n]+)/i
        );

        if (landlordMatch) {

            fields.push({
                code: "landlord_name",
                label: "Nom du bailleur",
                data_type: "string",
                source: "landlord.name",
                required: true,
                value: this.cleanValue(landlordMatch[1]),
                confidence: 0.97
            });
        }


        // =====================================================
        // ADRESSE DU BAILLEUR
        // =====================================================

        const landlordAddressMatch = text.match(
            /BAILLEUR[^\n]*\nAdresse\s*:\s*([^\n]+)/i
        );

        if (landlordAddressMatch) {

            fields.push({
                code: "landlord_address",
                label: "Adresse du bailleur",
                data_type: "string",
                source: "landlord.address",
                required: false,
                value: this.cleanValue(landlordAddressMatch[1]),
                confidence: 0.94
            });
        }


        // =====================================================
        // TÉLÉPHONE DU BAILLEUR
        // =====================================================

        const landlordPhoneMatch = text.match(
            /BAILLEUR[\s\S]{0,300}?Téléphone\s*:\s*([+\d][\d\s-]{7,20})/i
        );

        if (landlordPhoneMatch) {

            fields.push({
                code: "landlord_phone",
                label: "Téléphone du bailleur",
                data_type: "string",
                source: "landlord.phone",
                required: false,
                value: this.cleanValue(landlordPhoneMatch[1]),
                confidence: 0.94
            });
        }


        // =====================================================
        // EMAIL DU BAILLEUR
        // =====================================================

        const landlordEmailMatch = text.match(
            /BAILLEUR[\s\S]{0,300}?[Ee]-mail\s*:\s*([^\s]+)/i
        );

        if (landlordEmailMatch) {

            fields.push({
                code: "landlord_email",
                label: "Email du bailleur",
                data_type: "string",
                source: "landlord.email",
                required: false,
                value: this.cleanValue(landlordEmailMatch[1]),
                confidence: 0.96
            });
        }


        // =====================================================
        // NOM DU LOCATAIRE
        // =====================================================

        const tenantMatch = text.match(
            /LOCATAIRE\s+([^\n]+)/i
        );

        if (tenantMatch) {

            fields.push({
                code: "tenant_name",
                label: "Nom du locataire",
                data_type: "string",
                source: "tenant.name",
                required: true,
                value: this.cleanValue(tenantMatch[1]),
                confidence: 0.97
            });
        }

        // =====================================================
        // DATE ET LIEU DE NAISSANCE
        // =====================================================

        const birthMatch = text.match(
            /N[ée]e?\s+le\s+([0-9]{1,2}(?:er|ère|ème|e)?\s+\w+\s+[0-9]{4})(?:\s+à\s+([^\n]+?))?(?=\s+CNI|\s+Téléphone|\s+E-mail|$)/i
        );

        if (birthMatch) {

            // -------------------------
            // DATE DE NAISSANCE
            // -------------------------

            fields.push({

                code: "tenant_birth_date",

                label: "Date de naissance",

                data_type: "date",

                source: "tenant.birth_date",

                required: false,

                value: this.cleanValue(birthMatch[1]),

                confidence: 0.95

            });


            // -------------------------
            // LIEU DE NAISSANCE
            // -------------------------

            if (birthMatch[2]) {

                fields.push({

                    code: "tenant_birth_place",

                    label: "Lieu de naissance",

                    data_type: "string",

                    source: "tenant.birth_place",

                    required: false,

                    value: this.cleanValue(birthMatch[2]),

                    confidence: 0.93

                });

            }

        }

        // =====================================================
        // TÉLÉPHONE DU LOCATAIRE
        // =====================================================

        const tenantPhoneMatch = text.match(
            /LOCATAIRE[\s\S]{0,300}?Téléphone\s*:\s*([+\d][\d\s-]{7,20})/i
        );

        if (tenantPhoneMatch) {

            fields.push({
                code: "tenant_phone",
                label: "Téléphone du locataire",
                data_type: "string",
                source: "tenant.phone",
                required: false,
                value: this.cleanValue(tenantPhoneMatch[1]),
                confidence: 0.95
            });
        }


        // =====================================================
        // EMAIL DU LOCATAIRE
        // =====================================================

        const tenantEmailMatch = text.match(
            /LOCATAIRE[\s\S]{0,300}?[Ee]-mail\s*:\s*([^\s]+)/i
        );

        if (tenantEmailMatch) {

            fields.push({
                code: "tenant_email",
                label: "Email du locataire",
                data_type: "string",
                source: "tenant.email",
                required: false,
                value: this.cleanValue(tenantEmailMatch[1]),
                confidence: 0.96
            });
        }


        // =====================================================
        // APPARTEMENT
        // =====================================================

        const apartmentMatch = text.match(
            /(?:appartement|logement)\s+([A-Z0-9-]+)\s*,?\s*situé/i
        );

        if (apartmentMatch) {

            fields.push({
                code: "apartment_number",
                label: "Numéro de l'appartement",
                data_type: "string",
                source: "apartment.number",
                required: true,
                value: this.cleanValue(apartmentMatch[1]),
                confidence: 0.94
            });
        }

        // =====================================================
        // NOM DE L'IMMEUBLE
        // =====================================================

        const buildingNameMatch = text.match(
            /(?:immeuble|résidence|residence)\s+([^,\n]+?)(?:,|\s+sis\s+à)/i
        );

        if (buildingNameMatch) {

            fields.push({
                code: "building_name",
                label: "Nom de l'immeuble",
                data_type: "string",
                source: "building.name",
                required: true,
                value: this.cleanValue(buildingNameMatch[1]),
                confidence: 0.96
            });
        }

        // =====================================================
        // ADRESSE DE L'IMMEUBLE
        // =====================================================

        const buildingAddressMatch = text.match(
            /(?:immeuble|résidence|residence)\s+[^,\n]+,\s*sis\s+à\s+(.+?),\s*(?:Dakar|[A-ZÀ-Ÿ][a-zà-ÿ]+),\s*(?:Sénégal|Senegal)/i
        );

        if (buildingAddressMatch) {

            fields.push({
                code: "building_address",
                label: "Adresse de l'immeuble",
                data_type: "string",
                source: "building.address",
                required: false,
                value: this.cleanValue(buildingAddressMatch[1]),
                confidence: 0.94
            });
        }

        // =====================================================
        // VILLE DE L'IMMEUBLE
        // =====================================================

        const buildingCityMatch = text.match(
            /sis\s+à\s+.+?,\s*([A-ZÀ-Ÿ][A-Za-zÀ-ÿ' -]+),\s*(?:Sénégal|Senegal)/i
        );

        if (buildingCityMatch) {

            fields.push({
                code: "building_city",
                label: "Ville de l'immeuble",
                data_type: "string",
                source: "building.city",
                required: false,
                value: this.cleanValue(buildingCityMatch[1]),
                confidence: 0.94
            });
        }

        // =====================================================
        // PAYS DE L'IMMEUBLE
        // =====================================================

        const buildingCountryMatch = text.match(
            /sis\s+à\s+.+?,\s*.+?,\s*(Sénégal|Senegal)/i
        );

        if (buildingCountryMatch) {

            fields.push({
                code: "building_country",
                label: "Pays de l'immeuble",
                data_type: "string",
                source: "building.country",
                required: false,
                value: this.cleanValue(buildingCountryMatch[1]),
                confidence: 0.99
            });
        }

        // =====================================================
        // SURFACE
        // =====================================================

        const surfaceMatch = text.match(
            /Surface\s+(?:approximative\s*)?:\s*([0-9]+(?:[.,][0-9]+)?)\s*m²/i
        );

        if (surfaceMatch) {

            fields.push({
                code: "apartment_surface",
                label: "Surface du logement",
                data_type: "number",
                source: "apartment.surface",
                required: false,
                value: Number(surfaceMatch[1].replace(",", ".")),
                confidence: 0.97
            });
        }


        // =====================================================
        // ÉTAGE
        // =====================================================

        const levelMatch = text.match(
            /(?:au|situé\s+au|situe\s+au)\s+([0-9]{1,2}(?:er|ère|ème|e)?\s+étage|rez[- ]de[- ]chaussée)/i
        );

        if (levelMatch) {

            fields.push({
                code: "apartment_level",
                label: "Étage",
                data_type: "string",
                source: "lease.level",
                required: false,
                value: this.cleanValue(levelMatch[1]),
                confidence: 0.95
            });
        }


        // =====================================================
        // LOYER
        // =====================================================

        const rentMatch = text.match(
            /Loyer\s+mensuel\s+([0-9][0-9\s.,]*)\s*FCFA/i
        );

        if (rentMatch) {

            fields.push({
                code: "monthly_rent",
                label: "Loyer mensuel",
                data_type: "number",
                source: "lease.monthly_rent",
                required: true,
                value: this.parseMoney(rentMatch[1]),
                confidence: 0.99
            });
        }


        // =====================================================
        // CHARGES COMMUNES
        // =====================================================

        const chargesMatch = text.match(
            /Charges\s+communes\s+([0-9][0-9\s.,]*)\s*FCFA/i
        );

        if (chargesMatch) {

            fields.push({
                code: "common_charges",
                label: "Charges communes",
                data_type: "number",
                source: "lease.common_charges",
                required: false,
                value: this.parseMoney(chargesMatch[1]),
                confidence: 0.99
            });
        }


        // =====================================================
        // TOTAL MENSUEL
        // =====================================================

        const totalMatch = text.match(
            /Total\s+mensuel\s+([0-9][0-9\s.,]*)\s*FCFA/i
        );

        if (totalMatch) {

            fields.push({

                code: "monthly_total",

                label: "Total mensuel",

                data_type: "number",

                source: "lease.monthly_total",

                required: false,

                value:
                    this.parseMoney(totalMatch[1]),

                confidence: 0.99
            });
        }

        // =====================================================
        // DÉPÔT DE GARANTIE
        // =====================================================

        const depositMatch = text.match(
            /Dépôt\s+de\s+garantie\s+([0-9][0-9\s.,]*)\s*FCFA/i
        );

        if (depositMatch) {

            fields.push({
                code: "deposit",
                label: "Dépôt de garantie",
                data_type: "number",
                source: "lease.deposit",
                required: false,
                value: this.parseMoney(depositMatch[1]),
                confidence: 0.99
            });
        }


        // =====================================================
        // DURÉE
        // =====================================================

        const durationMatch = text.match(
            /durée\s+de\s+([0-9]+)\s*(mois|ans?|années?)/i
        );

        if (durationMatch) {

            let months = Number(durationMatch[1]);

            if (
                durationMatch[2].toLowerCase().includes("an")
            ) {
                months *= 12;
            }

            fields.push({
                code: "lease_duration_months",
                label: "Durée du bail",
                data_type: "number",
                source: "lease.duration",
                required: true,
                value: months,
                confidence: 0.98
            });
        }

        // =====================================================
        // DATE DE DÉBUT
        // =====================================================

        const startMatch = text.match(
            /prenant\s+effet\s+le\s+([0-9]{1,2}(?:er|ère|e|ème)?\s+\w+\s+[0-9]{4})/i
        );

        if (startMatch) {

            fields.push({
                code: "lease_start_date",
                label: "Date de début du bail",
                data_type: "date",
                source: "lease.start_date",
                required: true,
                value: this.cleanValue(startMatch[1]),
                confidence: 0.99
            });
        }


        // =====================================================
        // DATE DE FIN
        // =====================================================

        const endMatch = text.match(
            /arrivant\s+à\s+échéance\s+le\s+([0-9]{1,2}\s+\w+\s+[0-9]{4})/i
        );

        if (endMatch) {

            fields.push({
                code: "lease_end_date",
                label: "Date de fin du bail",
                data_type: "date",
                source: "lease.end_date",
                required: true,
                value: this.cleanValue(endMatch[1]),
                confidence: 0.98
            });
        }


        // =====================================================
        // JOUR DE PAIEMENT
        // =====================================================

        const paymentDayMatch = text.match(
            /Date\s+de\s+paiement\s+Au\s+plus\s+tard\s+le\s+([0-9]{1,2})/i
        );

        if (paymentDayMatch) {

            fields.push({
                code: "payment_day",
                label: "Jour de paiement",
                data_type: "number",
                source: "lease.payment_day",
                required: false,
                value: Number(paymentDayMatch[1]),
                confidence: 0.99
            });
        }


        // =====================================================
        // MODE DE PAIEMENT
        // =====================================================

        const paymentModeMatch = text.match(
            /Mode\s+de\s+paiement\s+([^\n]+)/i
        );

        if (paymentModeMatch) {

            fields.push({
                code: "payment_method",
                label: "Mode de paiement",
                data_type: "string",
                source: "agency_terms.payment_method",
                required: false,
                value: this.cleanValue(paymentModeMatch[1]),
                confidence: 0.95
            });
        }


        // =====================================================
        // COMPTEUR ÉLECTRIQUE
        // =====================================================

        const electricityMatch = text.match(
            /compteur\s+individuel\s+n[°o]?\s*([A-Z0-9-]+)/i
        );

        if (electricityMatch) {

            fields.push({
                code: "electricity_meter_number",
                label: "Numéro du compteur électrique",
                data_type: "string",
                source: "lease_terms.electricity_meter_number",
                required: false,
                value: this.cleanValue(electricityMatch[1]),
                confidence: 0.97
            });
        }


        // =====================================================
        // COMPTEUR EAU
        // =====================================================

        const waterMatch = text.match(
            /compteur\s+n[°o]?\s*([A-Z0-9-]+)\s*\.?\s*Les charges|compteur\s+n[°o]?\s*([A-Z0-9-]+)/i
        );

        if (waterMatch) {

            const value =
                waterMatch[1] ||
                waterMatch[2];

            if (value) {

                fields.push({
                    code: "water_meter_number",
                    label: "Numéro du compteur d'eau",
                    data_type: "string",
                    source: "lease_terms.water_meter_number",
                    required: false,
                    value: this.cleanValue(value),
                    confidence: 0.90
                });
            }
        }


        return fields;
    }

    // =========================================================
    // MONNAIE
    // =========================================================

    static parseMoney(value) {

        if (!value) {
            return null;
        }

        const cleaned = String(value)
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(/,/g, "");

        const number = Number(cleaned);

        return Number.isFinite(number)
            ? number
            : null;
    }

    // =========================================================
    // TERMES SPÉCIFIQUES
    // =========================================================

    static detectTerms(text) {

        const terms = [];

        const normalized = this.normalizeSearchText(text);


        // =====================================================
        // SOUS-LOCATION
        // =====================================================

        if (
            normalized.includes("sous-location") ||
            normalized.includes("sous location")
        ) {

            let value = "conditional";

            if (
                normalized.includes("sous-location interdite") ||
                normalized.includes("sous location interdite") ||
                normalized.includes("interdit de sous-louer")
            ) {
                value = "forbidden";
            }

            else if (
                normalized.includes("sous-location autorisee") ||
                normalized.includes("sous location autorisee")
            ) {
                value = "allowed";
            }

            terms.push({

                code: "sublease_policy",

                label: "Politique de sous-location",

                value_type: "enum",

                default_value: value,

                description:
                    "Règle de sous-location détectée dans le contrat.",

                confidence: 0.92
            });
        }


        // =====================================================
        // RÉVISION DU LOYER
        // =====================================================

        const revisionMatch = text.match(
            /(?:révision|revision)[^0-9]{0,100}([0-9]+(?:[.,][0-9]+)?)\s*%/i
        );

        if (revisionMatch) {

            terms.push({

                code: "rent_revision_rate",

                label: "Taux de révision du loyer",

                value_type: "number",

                default_value:
                    Number(
                        revisionMatch[1].replace(",", ".")
                    ),

                description:
                    "Taux de révision du loyer.",

                confidence: 0.92
            });
        }


        // =====================================================
        // ÉLECTRICITÉ
        // =====================================================

        if (
            normalized.includes(
                "electricite consommee dans l'appartement est a la charge de la locataire"
            )
        ) {

            terms.push({

                code: "electricity_paid_by_tenant",

                label: "Électricité à la charge du locataire",

                value_type: "boolean",

                default_value: true,

                description:
                    "La consommation électrique est supportée par le locataire.",

                confidence: 0.97
            });
        }


        // =====================================================
        // EAU
        // =====================================================

        if (
            normalized.includes(
                "consommation d'eau est facturée"
            ) ||
            normalized.includes(
                "consommation d'eau est facturee"
            )
        ) {

            terms.push({

                code: "water_billed_by_meter",

                label: "Eau facturée au compteur",

                value_type: "boolean",

                default_value: true,

                description:
                    "La consommation d'eau est facturée sur la base d'un compteur.",

                confidence: 0.95
            });
        }


        // =====================================================
        // CHARGES COMMUNES
        // =====================================================

        const chargesMatch = text.match(
            /charges\s+communes\s+mensuelles\s+sont\s+fixées\s+à\s+([0-9][0-9\s.,]*)\s*FCFA/i
        );

        if (chargesMatch) {

            terms.push({

                code: "common_charges_amount",

                label: "Montant des charges communes",

                value_type: "number",

                default_value:
                    this.parseMoney(chargesMatch[1]),

                description:
                    "Montant mensuel des charges communes.",

                confidence: 0.98
            });
        }


        // =====================================================
        // COMPTEURS
        // =====================================================

        if (normalized.includes("compteur individuel")) {

            terms.push({

                code: "individual_meters",

                label: "Compteurs individuels",

                value_type: "boolean",

                default_value: true,

                description:
                    "Le logement dispose d'au moins un compteur individuel.",

                confidence: 0.97
            });
        }


        // =====================================================
        // ANIMAUX
        // =====================================================

        if (
            normalized.includes("animaux interdits") ||
            normalized.includes("animaux domestiques interdits")
        ) {

            terms.push({

                code: "animals_policy",

                label: "Politique concernant les animaux",

                value_type: "enum",

                default_value: "forbidden",

                description:
                    "Les animaux sont interdits.",

                confidence: 0.95
            });

        } else if (
            normalized.includes("animaux autorises") ||
            normalized.includes("animaux domestiques autorises")
        ) {

            terms.push({

                code: "animals_policy",

                label: "Politique concernant les animaux",

                value_type: "enum",

                default_value: "allowed",

                description:
                    "Les animaux sont autorisés.",

                confidence: 0.95
            });
        }


        return terms;
    }

    // =========================================================
    // EXTRACTION DES CLAUSES / ARTICLES
    // =========================================================

    static detectClauses(
        text,
        fields = [],
        terms = []
    ) {

        const clauses = [];

        const articleRegex =
            /(?:^|\n)\s*(?:ARTICLE\s*)?([0-9]{1,3})\s*[.\-–—:]\s*([^\n]+)/gi;

        const matches = [];

        let match;

        while (
            (match = articleRegex.exec(text)) !== null
        ) {

            const number =
                match[1];

            const title =
                this.cleanValue(match[2]);

            if (!title) {
                continue;
            }

            matches.push({

                number,

                title,

                index:
                    match.index,

                end:
                    articleRegex.lastIndex
            });
        }

        for (
            let i = 0;
            i < matches.length;
            i++
        ) {

            const current =
                matches[i];

            const next =
                matches[i + 1];

            const start =
                current.end;

            const end =
                next
                    ? next.index
                    : text.length;

            let content =
                this.cleanValue(
                    text.substring(start, end)
                );
            

            if (!content) {
                continue;
            }

            // Paramétrisation automatique
            content =
                this.parameterizeText(
                    content,
                    fields,
                    terms
                );

            const normalizedTitle =
                this
                    .normalizeSearchText(
                        current.title
                    )
                    .replace(
                        /[^a-z0-9]+/g,
                        "_"
                    )
                    .replace(
                        /^_+|_+$/g,
                        ""
                    );

            clauses.push({

                code:
                    `article_${current.number}_${normalizedTitle}`,

                title:
                    current.title,

                content,

                clause_order:
                    Number(current.number),

                enabled:
                    true,

                variables:
                    this.extractVariables(content),

                confidence:
                    0.97
            });
        }

        return clauses;
    }

    // =========================================================
    // VARIABLES DANS LES CLAUSES
    // =========================================================

    static extractVariables(text) {

        const variables = [];

        const patterns = [

            /\{\{([^}]+)\}\}/g,

            /\[([A-Z_][A-Z0-9_]*)\]/g

        ];

        for (
            const regex of patterns
        ) {

            let match;

            while (
                (match = regex.exec(text)) !== null
            ) {

                const variable =
                    this.cleanValue(match[1]);

                if (
                    variable &&
                    !variables.includes(variable)
                ) {

                    variables.push(variable);
                }
            }
        }

        return variables;
    }

    // =========================================================
    // PARAMÉTRISATION INTELLIGENTE DU DOCUMENT
    // =========================================================

    static parameterizeText(text, fields = [], terms = []) {

        let result = text;


        // =====================================================
        // VALEURS DE CHAMPS
        // =====================================================

        for (const field of fields) {

            if (
                !field ||
                field.value === null ||
                field.value === undefined ||
                String(field.value).trim() === ""
            ) {
                continue;
            }

            const placeholder =
                `{{${field.code}}}`;

            const value =
                String(field.value).trim();


            // =================================================
            // NUMÉRO DE CNI
            // =================================================

            if (field.code === "tenant_identity_number") {

                result =
                    result.replace(
                        /(\bCNI\s+n[°o]?\s*)([0-9][0-9\s]{5,25})/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // NOM DU BAILLEUR
            // =================================================

            if (field.code === "landlord_name") {

                result =
                    result.replace(
                        /(BAILLEUR\s+)([^\n]+?)(?=\s+Adresse\s*:)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // ADRESSE DU BAILLEUR
            // =================================================

            if (field.code === "landlord_address") {

                result =
                    result.replace(
                        /(Adresse\s*:\s*)([^\n]+?)(?=\s+Téléphone\s*:)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // TÉLÉPHONE DU BAILLEUR
            // =================================================

            if (field.code === "landlord_phone") {

                result =
                    result.replace(
                        /(BAILLEUR[\s\S]{0,200}?Téléphone\s*:\s*)([+\d][\d\s-]{7,20})/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // EMAIL DU BAILLEUR
            // =================================================

            if (field.code === "landlord_email") {

                result =
                    result.replace(
                        /(BAILLEUR[\s\S]{0,250}?[Ee]-mail\s*:\s*)([^\s]+)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // NOM DU LOCATAIRE
            // =================================================

            if (field.code === "tenant_name") {

                result =
                    result.replace(
                        /(LOCATAIRE\s+)([^\n]+?)(?=\s+N[ée]e?\s+le)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // DATE DE NAISSANCE
            // =================================================

            if (field.code === "tenant_birth_date") {

                result =
                    result.replace(
                        /(N[ée]e?\s+le\s+)([0-9]{1,2}(?:er|ère|ème|e)?\s+\w+\s+[0-9]{4})/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // LIEU DE NAISSANCE
            // =================================================

            if (field.code === "tenant_birth_place") {

                result =
                    result.replace(
                        /(N[ée]e?\s+le\s+[^\n]+?\s+à\s+)([^,\n]+?)(?=\s+CNI)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // TÉLÉPHONE LOCATAIRE
            // =================================================

            if (field.code === "tenant_phone") {

                result =
                    result.replace(
                        /(LOCATAIRE[\s\S]{0,300}?Téléphone\s*:\s*)([+\d][\d\s-]{7,20})/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // EMAIL LOCATAIRE
            // =================================================

            if (field.code === "tenant_email") {

                result =
                    result.replace(
                        /(LOCATAIRE[\s\S]{0,300}?[Ee]-mail\s*:\s*)([^\s]+)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // APPARTEMENT
            // =================================================

            if (field.code === "apartment_number") {

                result =
                    result.replace(
                        /(l['’]appartement\s+)([A-Z0-9-]+)(?=,?\s*situé)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // NOM DE L'IMMEUBLE
            // =================================================

            if (field.code === "building_name") {

                const escaped =
                    this.escapeRegExp(value);

                result =
                    result.replace(
                        new RegExp(
                            `(immeuble\\s+)${escaped}`,
                            "i"
                        ),
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // ADRESSE DE L'IMMEUBLE
            // =================================================

            if (field.code === "building_address") {

                result =
                    result.replace(
                        /(sis\s+à\s+)([^,\n]+)(?=,\s*[^,\n]+,\s*(?:Sénégal|Senegal))/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // VILLE DE L'IMMEUBLE
            // =================================================

            if (field.code === "building_city") {

                result =
                    result.replace(
                        /(sis\s+à\s+[^,\n]+,\s*)([^,\n]+)(?=\s*,\s*(?:Sénégal|Senegal))/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // PAYS
            // =================================================

            if (field.code === "building_country") {

                result =
                    result.replace(
                        /(\bsis\s+à\s+[^.\n]+,\s*)(Sénégal|Senegal)\b/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // SURFACE
            // =================================================

            if (field.code === "apartment_surface") {

                result =
                    result.replace(
                        /(Surface\s+(?:approximative\s*)?:\s*)([0-9]+(?:[.,][0-9]+)?)\s*m²/i,
                        `$1${placeholder} m²`
                    );

                continue;
            }


            // =================================================
            // ÉTAGE
            // =================================================

            if (field.code === "apartment_level") {

                const escaped =
                    this.escapeRegExp(value);

                result =
                    result.replace(
                        new RegExp(
                            `(situé\\s+au\\s+)${escaped}`,
                            "i"
                        ),
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // LOYER
            // =================================================

            if (field.code === "monthly_rent") {

                result =
                    result.replace(
                        /(Loyer\s+mensuel\s+)([0-9][0-9\s.,]*)\s*FCFA/i,
                        `$1${placeholder} FCFA`
                    );

                continue;
            }


            // =================================================
            // CHARGES
            // =================================================

            if (field.code === "common_charges") {

                result =
                    result.replace(
                        /(Charges\s+communes\s+)([0-9][0-9\s.,]*)\s*FCFA/i,
                        `$1${placeholder} FCFA`
                    );

                continue;
            }


            // =================================================
            // TOTAL MENSUEL
            // =================================================

            if (field.code === "monthly_total") {

                result =
                    result.replace(
                        /(Total\s+mensuel\s+)([0-9][0-9\s.,]*)\s*FCFA/i,
                        `$1${placeholder} FCFA`
                    );

                continue;
            }


            // =================================================
            // DÉPÔT
            // =================================================

            if (field.code === "deposit") {

                result =
                    result.replace(
                        /(Dépôt\s+de\s+garantie\s+)([0-9][0-9\s.,]*)\s*FCFA/i,
                        `$1${placeholder} FCFA`
                    );

                continue;
            }


            // =================================================
            // DURÉE
            // =================================================

            if (field.code === "lease_duration_months") {

                result =
                    result.replace(
                        /(durée\s+de\s+)([0-9]+)\s*(mois|ans?|années?)/i,
                        `$1${placeholder} mois`
                    );

                continue;
            }


            // =================================================
            // DATE DE DÉBUT
            // =================================================

            if (field.code === "lease_start_date") {

                result =
                    result.replace(
                        /(prenant\s+effet\s+le\s+)([0-9]{1,2}(?:er|ère|ème|e)?\s+\w+\s+[0-9]{4})/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // DATE DE FIN
            // =================================================

            if (field.code === "lease_end_date") {

                result =
                    result.replace(
                        /(arrivant\s+à\s+échéance\s+le\s+)([0-9]{1,2}\s+\w+\s+[0-9]{4})/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // JOUR DE PAIEMENT
            // =================================================

            if (field.code === "payment_day") {

                result =
                    result.replace(
                        /(Au\s+plus\s+tard\s+le\s+)([0-9]{1,2})(?=\s+de\s+chaque\s+mois)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // MODE DE PAIEMENT
            // =================================================

            if (field.code === "payment_method") {

                result =
                    result.replace(
                        /(Mode\s+de\s+paiement\s+)([^\n]+)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // COMPTEUR ÉLECTRIQUE
            // =================================================

            if (field.code === "electricity_meter_number") {

                result =
                    result.replace(
                        /(compteur\s+individuel\s+n[°o]?\s*)([A-Z0-9-]+)/i,
                        `$1${placeholder}`
                    );

                continue;
            }


            // =================================================
            // COMPTEUR EAU
            // =================================================

            if (field.code === "water_meter_number") {

                result =
                    result.replace(
                        /(compteur\s+n[°o]?\s*)([A-Z0-9-]+)(?=\s*\.)/i,
                        `$1${placeholder}`
                    );

                continue;
            }

        }


        // =====================================================
        // TERMES
        // =====================================================

        for (const term of terms) {

            if (
                !term ||
                term.default_value === null ||
                term.default_value === undefined
            ) {
                continue;
            }


            // -----------------------------------------------
            // CHARGES COMMUNES
            // -----------------------------------------------

            if (
                term.code === "common_charges_amount"
            ) {

                result =
                    result.replace(
                        /(charges\s+communes\s+mensuelles\s+sont\s+fixées\s+à\s+)([0-9][0-9\s.,]*)\s*FCFA/i,
                        `$1{{common_charges_amount}} FCFA`
                    );

                continue;
            }

        }


        return result;
    }


    // =========================================================
    // ÉCHAPPER UNE VALEUR POUR REGEXP
    // =========================================================

    static escapeRegExp(value = "") {

        return String(value)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    }   


    // =========================================================
    // FORMAT NUMÉRIQUE POUR RECHERCHE
    // =========================================================

    static formatNumberForSearch(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return Number(value)
            .toLocaleString("fr-FR")
            .replace(/\u00A0/g, " ");

    }

    // =========================================================
    // ANALYSE GLOBALE
    // =========================================================

    static async analyze(filePath) {

        const extraction =
            await this.extractPDF(filePath);

        // -----------------------------------------------------
        // PDF SCANNÉ / IMAGE
        // -----------------------------------------------------

        if (!extraction.hasText) {

            return {
                status: "OCR_REQUIRED",

                document: {
                    pages: extraction.pages,
                    has_text: false
                },

                analysis: {
                    document_type: "UNKNOWN",
                    fields: [],
                    terms: [],
                    clauses: []
                }
            };
        }

        // -----------------------------------------------------
        // NETTOYAGE DU TEXTE
        // -----------------------------------------------------

        const cleanedText =
            this.cleanDocumentText(extraction.text);

        // -----------------------------------------------------
        // ANALYSE DU DOCUMENT
        // -----------------------------------------------------

        const documentType =
            this.detectDocumentType(cleanedText);

        const fields =
            this.detectFields(cleanedText);

        const terms =
            this.detectTerms(cleanedText);

        const clauses =
            this.detectClauses(
                cleanedText,
                fields,
                terms
            );

        // -----------------------------------------------------
        // RÉSULTAT
        // -----------------------------------------------------

        return {

            status: "ANALYZED",

            document: {
                pages: extraction.pages,
                has_text: true,
                text_length: cleanedText.length,
                text: cleanedText
            },

            analysis: {

                document_type:
                    documentType,

                fields,

                terms,

                clauses
            }
        };
    }

    // =========================================================
    // NETTOYAGE DU DOCUMENT
    // =========================================================

    static cleanDocumentText(text = "") {

        return text

            // Pieds de page PDF
            .replace(
                /--\s*\d+\s+of\s+\d+\s*--/gi,
                ""
            )

            .replace(
                /--\s*\d+\s+sur\s+\d+\s*--/gi,
                ""
            )

            // En-têtes répétés
            .replace(
                /TTS-Immo\s+—\s+Contrat\s+de\s+location\s+—\s+Simulation\s+Page\s+\d+/gi,
                ""
            )

            // Texte de simulation final
            .replace(
                /DOCUMENT\s+DE\s+SIMULATION[\s\S]*$/i,
                ""
            )

            // Espaces
            .replace(
                /[ \t]+/g,
                " "
            )

            .replace(
                /\n{3,}/g,
                "\n\n"
            )

            .trim();
    }
}


module.exports = DocumentAIService;