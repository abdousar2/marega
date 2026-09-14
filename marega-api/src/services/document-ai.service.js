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
        // HELPER
        // =====================================================

        const addField = ({
            code,
            label,
            data_type,
            source,
            required = false,
            value,
            confidence = 0.90
        }) => {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return;
            }

            fields.push({

                code,

                label,

                data_type,

                source,

                required,

                value,

                confidence

            });

        };


        // =====================================================
        // IDENTITÉ LOCATAIRE
        // =====================================================

        let tenantName = null;

        const tenantNameMatch = text.match(
            /LOCATAIRE\s+(.+?)(?=\s+N[ée]e?\s+le\b|\s+CNI\b|\s+Téléphone\b|\s+E-mail\b|$)/i
        );

        if (tenantNameMatch) {
            tenantName =
                this.cleanValue(
                    tenantNameMatch[1]
                );
        }

        if (!tenantName) {

            tenantName =
                this.extractLabeledValue(
                    text,
                    [
                        "LOCATAIRE",
                        "LE LOCATAIRE",
                        "PRENEUR"
                    ]
                );
        }

        addField({

            code: "tenant_name",

            label: "Nom du locataire",

            data_type: "string",

            source: "tenant.name",

            required: true,

            value: tenantName,

            confidence: 0.96

        });


        // =====================================================
        // CNI LOCATAIRE
        // =====================================================

        const identityRegex =
            /(?:CNI|carte\s+d['’]identité|pi[eè]ce\s+d['’]identité|num[eé]ro\s+de\s+(?:la\s+)?pi[eè]ce)[^0-9]{0,50}([0-9][0-9\s]{5,30})/i;

        const identityMatch =
            text.match(identityRegex);

        if (identityMatch) {

            addField({

                code: "tenant_identity_number",

                label: "Numéro de pièce d'identité",

                data_type: "string",

                source: "tenant.identity_number",

                value:
                    identityMatch[1]
                        .replace(/\s/g, ""),

                confidence: 0.97

            });

        }


        // =====================================================
        // DATE DE NAISSANCE
        // =====================================================

        const birthRegex =
            /(?:né|née|ne|date\s+de\s+naissance)[^0-9]{0,40}([0-9]{1,2}(?:er)?\s+[A-Za-zÀ-ÿ]+\s+[0-9]{4})/i;

        const birthMatch =
            text.match(birthRegex);

        if (birthMatch) {

            addField({

                code: "tenant_birth_date",

                label: "Date de naissance",

                data_type: "date",

                source: "tenant.birth_date",

                value:
                    this.cleanValue(
                        birthMatch[1]
                    ),

                confidence: 0.93

            });

        }

        // =====================================================
        // LIEU DE NAISSANCE
        // =====================================================

        let birthPlace = null;

        const birthPlacePatterns = [

            // "Née le 15 mars 1995 à Dakar"
            /(?:né|née|ne)\s+le\s+[0-9]{1,2}(?:er)?\s+[A-Za-zÀ-ÿ]+\s+[0-9]{4}\s+à\s+([^,\n]+?)(?=\s+CNI|\s+carte|\s+téléphone|\s+email|$)/i,

            // "Née le 15 mars 1995 à Dakar"
            /date\s+de\s+naissance\s*[:\-]?\s*[0-9]{1,2}(?:er)?\s+[A-Za-zÀ-ÿ]+\s+[0-9]{4}\s+à\s+([^,\n]+)/i
        ];

        for (const regex of birthPlacePatterns) {

            const match = text.match(regex);

            if (match) {

                birthPlace =
                    this.cleanValue(match[1]);

                break;
            }
        }

        addField({

            code: "tenant_birth_place",

            label: "Lieu de naissance",

            data_type: "string",

            source: "tenant.birth_place",

            value: birthPlace,

            confidence: birthPlace
                ? 0.95
                : 0

        });

        // =====================================================
        // PROFESSION
        // =====================================================

        let profession = null;


        // -----------------------------------------------------
        // CAS 1 : Profession : commerçante
        // -----------------------------------------------------

        const professionRegex =
            /(?:profession\s+du\s+locataire|profession|activité\s+professionnelle)\s*[:\-]\s*([^\n]+)/i;

        const professionMatch =
            text.match(professionRegex);

        if (professionMatch) {

            profession =
                this.cleanValue(
                    professionMatch[1]
                );

        }


        // -----------------------------------------------------
        // CAS 2 : "Le locataire exerce la profession de..."
        // -----------------------------------------------------

        if (!profession) {

            const professionSentenceRegex =
                /(?:le|la)\s+locataire\s+exerce\s+(?:la\s+profession\s+de\s+)?([^,.\n]+)/i;

            const professionSentenceMatch =
                text.match(
                    professionSentenceRegex
                );

            if (professionSentenceMatch) {

                profession =
                    this.cleanValue(
                        professionSentenceMatch[1]
                    );
            }
        }


        addField({

            code: "tenant_profession",

            label: "Profession",

            data_type: "string",

            source: "tenant.profession",

            value: profession,

            confidence: profession
                ? 0.95
                : 0
        });


        // =====================================================
        // TÉLÉPHONE LOCATAIRE
        // =====================================================

        const tenantPhoneRegex =
            /(?:locataire|preneur)[\s\S]{0,300}?(?:t[eé]l[eé]phone|t[eé]l\.?)[^0-9+]{0,20}(\+?[0-9][0-9\s-]{7,20})/i;

        const tenantPhoneMatch =
            text.match(tenantPhoneRegex);

        if (tenantPhoneMatch) {

            addField({

                code: "tenant_phone",

                label: "Téléphone du locataire",

                data_type: "string",

                source: "tenant.phone",

                value:
                    this.cleanValue(
                        tenantPhoneMatch[1]
                    ),

                confidence: 0.94

            });

        }


        // =====================================================
        // EMAIL LOCATAIRE
        // =====================================================

        const tenantEmailRegex =
            /(?:locataire|preneur)[\s\S]{0,300}?(?:e-mail|email)[^A-Za-z0-9._%+-]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i;

        const tenantEmailMatch =
            text.match(tenantEmailRegex);

        if (tenantEmailMatch) {

            addField({

                code: "tenant_email",

                label: "Email du locataire",

                data_type: "string",

                source: "tenant.email",

                value:
                    tenantEmailMatch[1],

                confidence: 0.96

            });

        }


        // =====================================================
        // BAILLEUR
        // =====================================================

        const landlordName =
            this.extractLabeledValue(
                text,
                [
                    "BAILLEUR",
                    "LE BAILLEUR",
                    "PROPRIÉTAIRE",
                    "PROPRIETAIRE"
                ]
            );

        addField({

            code: "landlord_name",

            label: "Nom du bailleur",

            data_type: "string",

            source: "landlord.name",

            required: true,

            value: landlordName,

            confidence: 0.96

        });


        // =====================================================
        // ADRESSE BAILLEUR
        // =====================================================

        let landlordAddress = null;

        // Cas explicite :
        // Adresse du bailleur : ...
        // Adresse du propriétaire : ...
        landlordAddress =
            this.extractLabeledValue(
                text,
                [
                    "Adresse du bailleur",
                    "Adresse du propriétaire"
                ]
            );

        // Cas fréquent :
        // BAILLEUR ...
        // Adresse : ...
        if (!landlordAddress) {

            const landlordAddressMatch = text.match(
                /BAILLEUR[\s\S]{0,250}?\bAdresse\s*:\s*([^\n]+?)(?=\s+(?:Téléphone|Tél\.?|E-mail|Email)\s*:)/i
            );

            if (landlordAddressMatch) {

                landlordAddress =
                    this.cleanValue(
                        landlordAddressMatch[1]
                    );
            }
        }

        addField({

            code: "landlord_address",

            label: "Adresse du bailleur",

            data_type: "string",

            source: "landlord.address",

            value: landlordAddress,

            confidence: landlordAddress
                ? 0.96
                : 0

        });


        // =====================================================
        // TÉLÉPHONE BAILLEUR
        // =====================================================

        const landlordPhoneRegex =
            /(?:bailleur|propri[eé]taire)[\s\S]{0,300}?(?:t[eé]l[eé]phone|t[eé]l\.?)[^0-9+]{0,20}(\+?[0-9][0-9\s-]{7,20})/i;

        const landlordPhoneMatch =
            text.match(landlordPhoneRegex);

        if (landlordPhoneMatch) {

            addField({

                code: "landlord_phone",

                label: "Téléphone du bailleur",

                data_type: "string",

                source: "landlord.phone",

                value:
                    landlordPhoneMatch[1],

                confidence: 0.94

            });

        }


        // =====================================================
        // EMAIL BAILLEUR
        // =====================================================

        const landlordEmailRegex =
            /(?:bailleur|propri[eé]taire)[\s\S]{0,300}?(?:e-mail|email)[^A-Za-z0-9._%+-]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i;

        const landlordEmailMatch =
            text.match(landlordEmailRegex);

        if (landlordEmailMatch) {

            addField({

                code: "landlord_email",

                label: "Email du bailleur",

                data_type: "string",

                source: "landlord.email",

                value:
                    landlordEmailMatch[1],

                confidence: 0.96

            });

        }

        // =====================================================
        // APPARTEMENT
        // =====================================================

        const apartmentPatterns = [

            /l['’]appartement\s+(?:n[°o]\s*)?([A-Z0-9]+(?:-[A-Z0-9]+)*)/i,

            /appartement\s+n[°ºo]?\s*([A-Z0-9]+(?:-[A-Z0-9]+)*)/i,

            /logement\s+(?:n[°ºo]?\s*)?([A-Z0-9]+(?:-[A-Z0-9]+)*)/i,

            /porte\s+n[°ºo]?\s*([A-Z0-9]+(?:-[A-Z0-9]+)*)/i

        ];

        let apartmentNumber = null;

        for (const regex of apartmentPatterns) {

            const match =
                text.match(regex);

            if (match) {

                apartmentNumber =
                    this.cleanValue(match[1]);

                break;
            }
        }

        addField({

            code: "apartment_number",

            label: "Numéro du logement",

            data_type: "string",

            source: "apartment.number",

            required: true,

            value: apartmentNumber,

            confidence: apartmentNumber
                ? 0.97
                : 0
        });

        // =====================================================
        // IMMEUBLE
        // =====================================================

        const buildingRegex =
            /(?:immeuble|r[eé]sidence)\s+([^\n,]+)/i;

        const buildingMatch =
            text.match(buildingRegex);

        if (buildingMatch) {

            addField({

                code: "building_name",

                label: "Nom de l'immeuble",

                data_type: "string",

                source: "building.name",

                required: true,

                value:
                    this.cleanValue(
                        buildingMatch[1]
                    ),

                confidence: 0.94

            });

        }


        // =====================================================
        // ADRESSE / VILLE / PAYS IMMEUBLE
        // =====================================================

        const buildingLocationRegex =
            /(?:sis|situé|situe)\s+[àa]\s+([^.\n]+?)(?:,\s*([^,\n]+))?(?:,\s*(Sénégal|Senegal))?(?:\.|$)/i;

        const buildingLocationMatch =
            text.match(
                buildingLocationRegex
            );


        let buildingAddress = null;
        let buildingCity = null;
        let buildingCountry = null;


        if (buildingLocationMatch) {

            buildingAddress =
                this.cleanValue(
                    buildingLocationMatch[1]
                );

            buildingCity =
                buildingLocationMatch[2]
                    ? this.cleanValue(
                        buildingLocationMatch[2]
                    )
                    : null;

            buildingCountry =
                buildingLocationMatch[3]
                    ? this.cleanValue(
                        buildingLocationMatch[3]
                    )
                    : null;
        }


        addField({

            code: "building_address",

            label: "Adresse de l'immeuble",

            data_type: "string",

            source: "building.address",

            value: buildingAddress,

            confidence: buildingAddress
                ? 0.94
                : 0
        });


        addField({

            code: "building_city",

            label: "Ville de l'immeuble",

            data_type: "string",

            source: "building.city",

            value: buildingCity,

            confidence: buildingCity
                ? 0.94
                : 0
        });


        addField({

            code: "building_country",

            label: "Pays de l'immeuble",

            data_type: "string",

            source: "building.country",

            value: buildingCountry,

            confidence: buildingCountry
                ? 0.98
                : 0
        });

        // =====================================================
        // SURFACE
        // =====================================================

        const surfaceRegex =
            /(?:surface|superficie)[^0-9]{0,30}([0-9]+(?:[.,][0-9]+)?)\s*m[²2]/i;

        const surfaceMatch =
            text.match(surfaceRegex);

        if (surfaceMatch) {

            addField({

                code: "apartment_surface",

                label: "Surface du logement",

                data_type: "number",

                source: "apartment.surface",

                value:
                    Number(
                        surfaceMatch[1]
                            .replace(",", ".")
                    ),

                confidence: 0.96

            });

        }


        // =====================================================
        // ÉTAGE
        // =====================================================

        const levelRegex =
            /(?:au|situ[eé]\s+au|[aà]\s+l['’]?)\s*([0-9]{1,2}(?:er|ère|e|ème)?\s+étage|rez[- ]de[- ]chauss[eé]e)/i;

        const levelMatch =
            text.match(levelRegex);

        if (levelMatch) {

            addField({

                code: "apartment_level",

                label: "Étage",

                data_type: "string",

                source: "lease.level",

                value:
                    this.cleanValue(
                        levelMatch[1]
                    ),

                confidence: 0.94

            });

        }


        // =====================================================
        // LOYER
        // =====================================================

        const rentRegex =
            /(?:loyer\s+mensuel|loyer)[^0-9]{0,40}([0-9][0-9\s.,]*)\s*(?:FCFA|CFA|F\s*CFA)/i;

        const rentMatch =
            text.match(rentRegex);

        if (rentMatch) {

            addField({

                code: "monthly_rent",

                label: "Loyer mensuel",

                data_type: "number",

                source: "lease.monthly_rent",

                required: true,

                value:
                    this.parseMoney(
                        rentMatch[1]
                    ),

                confidence: 0.98

            });

        }


        // =====================================================
        // CHARGES
        // =====================================================

        const chargesRegex =
            /charges(?:\s+communes)?[^0-9]{0,50}([0-9][0-9\s.,]*)\s*(?:FCFA|CFA|F\s*CFA)/i;

        const chargesMatch =
            text.match(chargesRegex);

        if (chargesMatch) {

            addField({

                code: "common_charges",

                label: "Charges communes",

                data_type: "number",

                source: "lease.common_charges",

                value:
                    this.parseMoney(
                        chargesMatch[1]
                    ),

                confidence: 0.96

            });

        }

        // =====================================================
        // TOTAL MENSUEL
        // =====================================================

        const monthlyTotalRegex =
            /total\s+mensuel[^0-9]{0,30}([0-9][0-9\s.,]*)\s*(?:FCFA|CFA|F\s*CFA)/i;

        const monthlyTotalMatch =
            text.match(
                monthlyTotalRegex
            );

        if (monthlyTotalMatch) {

            addField({

                code: "monthly_total",

                label: "Total mensuel",

                data_type: "number",

                source: "lease.monthly_total",

                value:
                    this.parseMoney(
                        monthlyTotalMatch[1]
                    ),

                confidence: 0.98
            });
        }


        // =====================================================
        // DÉPÔT
        // =====================================================

        const depositRegex =
            /(?:d[eé]p[oô]t|caution|d[eé]p[oô]t\s+de\s+garantie)[^0-9]{0,50}([0-9][0-9\s.,]*)\s*(?:FCFA|CFA|F\s*CFA)/i;

        const depositMatch =
            text.match(depositRegex);

        if (depositMatch) {

            addField({

                code: "deposit",

                label: "Dépôt de garantie",

                data_type: "number",

                source: "lease.deposit",

                value:
                    this.parseMoney(
                        depositMatch[1]
                    ),

                confidence: 0.97

            });

        }


        // =====================================================
        // DURÉE DU BAIL
        // =====================================================

        const durationRegex =
            /dur[eé]e(?:\s+du\s+bail)?[^0-9]{0,40}([0-9]+)\s*(mois|ans?|ann[eé]es?)/i;

        const durationMatch =
            text.match(durationRegex);

        if (durationMatch) {

            let months =
                Number(
                    durationMatch[1]
                );

            if (
                /an|année/i.test(
                    durationMatch[2]
                )
            ) {

                months *= 12;

            }

            addField({

                code: "lease_duration_months",

                label: "Durée du bail",

                data_type: "number",

                source: "lease.duration",

                required: true,

                value: months,

                confidence: 0.96

            });

        }


        // =====================================================
        // DATE DE DÉBUT
        // =====================================================

        const startRegex =
            /(?:prenant\s+effet|d[eé]but|commence|[àa]\s+compter\s+du)[^0-9]{0,50}([0-9]{1,2}(?:er)?\s+[A-Za-zÀ-ÿ]+\s+[0-9]{4})/i;

        const startMatch =
            text.match(startRegex);

        if (startMatch) {

            addField({

                code: "lease_start_date",

                label: "Date de début du bail",

                data_type: "date",

                source: "lease.start_date",

                required: true,

                value:
                    this.cleanValue(
                        startMatch[1]
                    ),

                confidence: 0.96

            });

        }


        // =====================================================
        // DATE DE FIN
        // =====================================================

        const endRegex =
            /(?:[eé]ch[eé]ance|arrivant\s+[àa]\s+[eé]ch[eé]ance|fin|se\s+terminant)[^0-9]{0,60}([0-9]{1,2}(?:er)?\s+[A-Za-zÀ-ÿ]+\s+[0-9]{4})/i;

        const endMatch =
            text.match(endRegex);

        if (endMatch) {

            addField({

                code: "lease_end_date",

                label: "Date de fin du bail",

                data_type: "date",

                source: "lease.end_date",

                required: true,

                value:
                    this.cleanValue(
                        endMatch[1]
                    ),

                confidence: 0.96

            });

        }


        // =====================================================
        // JOUR DE PAIEMENT
        // =====================================================

        const paymentDayPatterns = [

            // "Au plus tard le 5 de chaque mois"
            /au\s+plus\s+tard\s+le\s+([0-9]{1,2})\s+de\s+chaque\s+mois/i,

            // "le 5 de chaque mois"
            /\ble\s+([0-9]{1,2})\s+de\s+chaque\s+mois/i,

            // "paiement le 5"
            /(?:date|jour)\s+de\s+paiement[^0-9]{0,30}([0-9]{1,2})/i,

            // "paiement : 5"
            /paiement\s*[:\-]\s*([0-9]{1,2})/i
        ];


        let paymentDay = null;


        for (const regex of paymentDayPatterns) {

            const match =
                text.match(regex);

            if (!match) {
                continue;
            }

            const day =
                Number(match[1]);

            if (
                Number.isInteger(day) &&
                day >= 1 &&
                day <= 31
            ) {

                paymentDay = day;

                break;
            }
        }


        addField({

            code: "payment_day",

            label: "Jour de paiement",

            data_type: "number",

            source: "lease.payment_day",

            value: paymentDay,

            confidence: paymentDay
                ? 0.98
                : 0
        });


        // =====================================================
        // MODE DE PAIEMENT
        // =====================================================

        const paymentMethod =
            this.extractLabeledValue(
                text,
                [
                    "Mode de paiement",
                    "Modalité de paiement",
                    "Modalités de paiement"
                ]
            );

        addField({

            code: "payment_method",

            label: "Mode de paiement",

            data_type: "string",

            source: "agency_terms.payment_method",

            value: paymentMethod,

            confidence: 0.92

        });


        // =====================================================
        // COMPTEUR ÉLECTRIQUE
        // =====================================================

        const electricityRegex =
            /compteur\s+(?:individuel|[eé]lectrique|d['’]électricité)[^A-Z0-9]{0,20}(?:n[°o]\s*)?([A-Z0-9-]+)/i;

        const electricityMatch =
            text.match(electricityRegex);

        if (electricityMatch) {

            addField({

                code: "electricity_meter_number",

                label: "Numéro du compteur électrique",

                data_type: "string",

                source: "lease_terms.electricity_meter_number",

                value:
                    electricityMatch[1],

                confidence: 0.97

            });
        }


        // =====================================================
        // COMPTEUR EAU
        // =====================================================

        let waterMeterNumber = null;

        // Cas principal :
        // "consommation d'eau ... compteur n° SDE-784512"
        const waterContextRegex =
            /consommation\s+d['’]eau[\s\S]{0,150}?compteur\s+n[°o]\s*([A-Z0-9-]+)/i;

        const waterContextMatch =
            text.match(waterContextRegex);

        if (waterContextMatch) {

            waterMeterNumber =
                waterContextMatch[1];

        } else {

            // Cas générique : "compteur d'eau n° SDE-784512"
            const waterRegex =
                /compteur\s+(?:d['’]eau|eau)\s*(?:n[°o]\s*)?([A-Z0-9-]+)/i;

            const waterMatch =
                text.match(waterRegex);

            if (waterMatch) {
                waterMeterNumber =
                    waterMatch[1];
            }
        }

        if (waterMeterNumber) {

            addField({

                code: "water_meter_number",

                label: "Numéro du compteur d'eau",

                data_type: "string",

                source: "lease_terms.water_meter_number",

                value: waterMeterNumber,

                confidence: 0.98

            });
        }


        return fields;
    }

    // =========================================================
    // MONNAIE
    // =========================================================

    static parseMoney(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        let cleaned =
            String(value)
                .replace(/\u00A0/g, " ")
                .replace(/FCFA/gi, "")
                .replace(/F\s*CFA/gi, "")
                .replace(/CFA/gi, "")
                .trim();

        // Retirer les espaces
        cleaned =
            cleaned.replace(/\s/g, "");

        // Exemple :
        // 500 000
        // 500.000
        // 500,000
        // 500000 FCFA

        cleaned =
            cleaned.replace(/[.,](?=\d{3}(?:[.,]|$))/g, "");

        // Si décimales éventuelles
        cleaned =
            cleaned.replace(/,/g, ".");

        const number =
            Number(cleaned);

        return Number.isFinite(number)
            ? number
            : null;
    }

    // =========================================================
    // REMPLACEMENT D'UNE VALEUR MONÉTAIRE
    // =========================================================

    static replaceMoneyValue(
        text,
        value,
        placeholder
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return text;
        }

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return text;
        }

        const variants = [

            String(number),

            number
                .toLocaleString("fr-FR")
                .replace(/\u00A0/g, " "),

            number
                .toLocaleString("fr-FR")
                .replace(/\u00A0/g, ""),

            number
                .toLocaleString("en-US")

        ];

        let result = text;

        for (const variant of variants) {

            const escaped =
                this.escapeRegExp(
                    variant
                );

            result =
                result.replace(
                    new RegExp(
                        `(?<![0-9])${escaped}(?![0-9])`,
                        "g"
                    ),
                    placeholder
                );
        }

        return result;
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
    // REMPLACER UNE VALEUR EXACTE PAR UN PLACEHOLDER
    // =========================================================

    static replaceExactValue(
        text,
        value,
        placeholder
    ) {

        if (
            !text ||
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return text;
        }

        const stringValue =
            String(value).trim();

        if (!stringValue) {
            return text;
        }

        const escaped =
            this.escapeRegExp(
                stringValue
            );

        return text.replace(
            new RegExp(
                `(?<![A-Za-zÀ-ÿ0-9])${escaped}(?![A-Za-zÀ-ÿ0-9])`,
                "g"
            ),
            placeholder
        );
    }

    // =========================================================
    // PARAMÉTRISATION INTELLIGENTE DU DOCUMENT
    // =========================================================

    static parameterizeText(text, fields = [], terms = []) {

        if (!text) {
            return text;
        }

        let result = text;

        // =====================================================
        // 1. REMPLACEMENTS SPÉCIFIQUES DES CHAMPS
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

            // -------------------------------------------------
            // CNI
            // -------------------------------------------------

            if (field.code === "tenant_identity_number") {

                result = result.replace(
                    /(\bCNI\s+n[°o]?\s*)([0-9][0-9\s]{5,30})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // BAILLEUR
            // -------------------------------------------------

            if (field.code === "landlord_name") {

                result = result.replace(
                    /(BAILLEUR\s+)([^\n]+?)(?=\s+Adresse\s*:)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "landlord_address") {

                result = result.replace(
                    /(Adresse\s*:\s*)([^\n]+?)(?=\s+(?:Téléphone|Tél\.?|E-mail|Email)\s*:)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "landlord_phone") {

                result = result.replace(
                    /(BAILLEUR[\s\S]{0,250}?(?:Téléphone|Tél\.?)\s*:\s*)([+\d][\d\s-]{7,20})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "landlord_email") {

                result = result.replace(
                    /(BAILLEUR[\s\S]{0,250}?(?:E-mail|Email)\s*:\s*)([^\s]+)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // LOCATAIRE
            // -------------------------------------------------

            if (field.code === "tenant_name") {

                result = result.replace(
                    /(LOCATAIRE\s+)([^\n]+?)(?=\s+N[ée]e?\s+le)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "tenant_identity_number") {

                result = result.replace(
                    /(\bCNI\s+n[°o]?\s*)([0-9][0-9\s]{5,30})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "tenant_birth_date") {

                result = result.replace(
                    /(N[ée]e?\s+le\s+)([0-9]{1,2}(?:er|ère|ème|e)?\s+\w+\s+[0-9]{4})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "tenant_birth_place") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(N[ée]e?\\s+le\\s+[0-9]{1,2}(?:er)?\\s+\\w+\\s+[0-9]{4}\\s+à\\s+)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "tenant_phone") {

                result = result.replace(
                    /(LOCATAIRE[\s\S]{0,300}?(?:Téléphone|Tél\.?)\s*:\s*)([+\d][\d\s-]{7,20})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "tenant_email") {

                result = result.replace(
                    /(LOCATAIRE[\s\S]{0,300}?(?:E-mail|Email)\s*:\s*)([^\s]+)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // LOGEMENT
            // -------------------------------------------------

            if (field.code === "apartment_number") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(l['’]appartement\\s+(?:n[°ºo]?\\s*)?)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "building_name") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(immeuble\\s+)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "building_address") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(sis\\s+à\\s+)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // IMPORTANT :
            // VILLE = remplacement uniquement dans
            // "sis à ADRESSE, VILLE"
            // -------------------------------------------------

            if (field.code === "building_city") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(sis\\s+à\\s+[^,\\n]+,\\s*)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // IMPORTANT :
            // PAYS = remplacement uniquement à la fin
            // de l'adresse de l'immeuble
            // -------------------------------------------------

            if (field.code === "building_country") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(sis\\s+à\\s+[^,\\n]+,\\s+[^,\\n]+,\\s*)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "apartment_surface") {

                result = result.replace(
                    /(Surface\s+(?:approximative\s*)?:\s*)([0-9]+(?:[.,][0-9]+)?)\s*m[²2]/gi,
                    `$1${placeholder} m²`
                );

                continue;
            }


            if (field.code === "apartment_level") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(situé\\s+au\\s+)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // FINANCES
            // -------------------------------------------------

            if (field.code === "monthly_rent") {

                result = result.replace(
                    /(Loyer\s+mensuel\s*)([:\-]?\s*)([0-9][0-9\s.,]*)\s*FCFA/gi,
                    `$1$2${placeholder} FCFA`
                );

                continue;
            }


            if (field.code === "common_charges") {

                result = result.replace(
                    /(Charges\s+communes\s*)([:\-]?\s*)([0-9][0-9\s.,]*)\s*FCFA/gi,
                    `$1$2${placeholder} FCFA`
                );

                continue;
            }


            if (field.code === "monthly_total") {

                result = result.replace(
                    /(Total\s+mensuel\s*)([:\-]?\s*)([0-9][0-9\s.,]*)\s*FCFA/gi,
                    `$1$2${placeholder} FCFA`
                );

                continue;
            }


            if (field.code === "deposit") {

                result = result.replace(
                    /(Dépôt\s+de\s+garantie\s*)([:\-]?\s*)([0-9][0-9\s.,]*)\s*FCFA/gi,
                    `$1$2${placeholder} FCFA`
                );

                result = result.replace(
                    /(dépôt\s+de\s+garantie\s+de\s+)([0-9][0-9\s.,]*)\s*FCFA/gi,
                    `$1${placeholder} FCFA`
                );

                continue;
            }


            // -------------------------------------------------
            // DURÉE
            // -------------------------------------------------

            if (field.code === "lease_duration_months") {

                result = result.replace(
                    /(durée\s+(?:du\s+bail)?\s*(?:est\s+)?(?:fixée\s+)?(?:à\s+|de\s+|pour\s+une\s+durée\s+de\s+))([0-9]+)\s*(mois|ans?|années?)/gi,
                    (match, prefix) => {
                        return `${prefix}${placeholder} mois`;
                    }
                );

                continue;
            }


            // -------------------------------------------------
            // DATE DE DÉBUT
            // -------------------------------------------------

            if (field.code === "lease_start_date") {

                result = result.replace(
                    /(prenant\s+effet\s+le\s+)([0-9]{1,2}(?:er)?\s+\w+\s+[0-9]{4})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // DATE DE FIN
            // -------------------------------------------------

            if (field.code === "lease_end_date") {

                result = result.replace(
                    /(arrivant\s+à\s+échéance\s+le\s+)([0-9]{1,2}(?:er)?\s+\w+\s+[0-9]{4})/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // JOUR DE PAIEMENT
            // -------------------------------------------------

            if (field.code === "payment_day") {

                result = result.replace(
                    /(Au\s+plus\s+tard\s+le\s+)([0-9]{1,2})(?=\s+de\s+chaque\s+mois)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // MODE DE PAIEMENT
            // -------------------------------------------------

            if (field.code === "payment_method") {

                result = result.replace(
                    /(Mode\s+de\s+paiement\s*[:\-]?\s*)([^\n]+)/gi,
                    `$1${placeholder}`
                );

                continue;
            }


            // -------------------------------------------------
            // COMPTEURS
            // -------------------------------------------------

            if (field.code === "electricity_meter_number") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(compteur\\s+individuel\\s+n[°o]?\\s*)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }


            if (field.code === "water_meter_number") {

                const escaped =
                    this.escapeRegExp(value);

                result = result.replace(
                    new RegExp(
                        `(compteur\\s+n[°o]?\\s*)${escaped}`,
                        "gi"
                    ),
                    `$1${placeholder}`
                );

                continue;
            }
        }


        // =====================================================
        // 2. TERMES SPÉCIFIQUES
        // =====================================================

        for (const term of terms) {

            if (
                !term ||
                term.default_value === null ||
                term.default_value === undefined
            ) {
                continue;
            }


            // -------------------------------------------------
            // SOUS-LOCATION
            // -------------------------------------------------

            if (term.code === "sublease_policy") {

                if (
                    String(term.default_value)
                        .toLowerCase() === "forbidden"
                ) {

                    result = result.replace(
                        /(sous-location\s+)(interdite)/gi,
                        `$1{{sublease_policy}}`
                    );

                    result = result.replace(
                        /(interdit\s+de\s+sous-louer)/gi,
                        `{{sublease_policy}}`
                    );
                }

                continue;
            }


            // -------------------------------------------------
            // RÉVISION DU LOYER
            // -------------------------------------------------

            if (term.code === "rent_revision_rate") {

                result = result.replace(
                    /((?:révision|revision)[^0-9]{0,100})([0-9]+(?:[.,][0-9]+)?)\s*%/gi,
                    `$1{{rent_revision_rate}} %`
                );

                continue;
            }


            // -------------------------------------------------
            // CHARGES COMMUNES
            // -------------------------------------------------

            if (term.code === "common_charges_amount") {

                result = result.replace(
                    /(charges\s+communes\s+mensuelles\s+sont\s+fixées\s+à\s+)([0-9][0-9\s.,]*)\s*FCFA/gi,
                    `$1{{common_charges_amount}} FCFA`
                );

                continue;
            }


            // -------------------------------------------------
            // PRÉAVIS
            // -------------------------------------------------

            if (term.code === "notice_period") {

                const value =
                    this.cleanValue(term.default_value);

                if (value) {

                    const escaped =
                        this.escapeRegExp(value);

                    result = result.replace(
                        new RegExp(
                            `(préavis\\s+de\\s+)${escaped}`,
                            "gi"
                        ),
                        `$1{{notice_period}}`
                    );
                }

                continue;
            }


            // -------------------------------------------------
            // RENOUVELLEMENT
            // -------------------------------------------------

            if (term.code === "renewal_duration_months") {

                const value =
                    this.cleanValue(term.default_value);

                if (value) {

                    const escaped =
                        this.escapeRegExp(value);

                    result = result.replace(
                        new RegExp(
                            `(renouvellement[^\\n]{0,80}?)(?:${escaped})\\s*(?:mois|ans?|années?)`,
                            "gi"
                        ),
                        `$1{{renewal_duration_months}} mois`
                    );
                }

                continue;
            }
        }


        // =====================================================
        // 3. CORRECTIONS FINALES CONTEXTUELLES
        // =====================================================

        // -----------------------------------------------------
        // LIEU DE NAISSANCE
        // -----------------------------------------------------

        const birthPlaceField =
            fields.find(
                field =>
                    field.code === "tenant_birth_place"
            );

        if (
            birthPlaceField &&
            birthPlaceField.value
        ) {

            const escaped =
                this.escapeRegExp(
                    birthPlaceField.value
                );

            result = result.replace(
                new RegExp(
                    `(N[ée]e?\\s+le\\s+[^\\n]+?\\s+à\\s+)${escaped}`,
                    "gi"
                ),
                "$1{{tenant_birth_place}}"
            );
        }


        // -----------------------------------------------------
        // DATE DE DÉBUT DANS L'ÉTAT DES LIEUX
        // -----------------------------------------------------

        const startField =
            fields.find(
                field =>
                    field.code === "lease_start_date"
            );

        if (
            startField &&
            startField.value
        ) {

            const escaped =
                this.escapeRegExp(
                    startField.value
                );

            result = result.replace(
                new RegExp(
                    `(état\\s+des\\s+lieux[^\\n]*?le\\s+)${escaped}`,
                    "gi"
                ),
                "$1{{lease_start_date}}"
            );


            // -------------------------------------------------
            // DATE DANS "FAIT À ..., LE ..."
            // -------------------------------------------------

            result = result.replace(
                new RegExp(
                    `(fait\\s+à\\s+[^,]+,\\s+le\\s+)${escaped}`,
                    "gi"
                ),
                "$1{{lease_start_date}}"
            );


            // -------------------------------------------------
            // AUTRES FORMULATIONS
            // -------------------------------------------------

            result = result.replace(
                new RegExp(
                    `(à\\s+compter\\s+du\\s+)${escaped}`,
                    "gi"
                ),
                "$1{{lease_start_date}}"
            );
        }


        // -----------------------------------------------------
        // COMPTEUR ÉLECTRIQUE
        // -----------------------------------------------------

        const electricityField =
            fields.find(
                field =>
                    field.code ===
                    "electricity_meter_number"
            );

        if (
            electricityField &&
            electricityField.value
        ) {

            result = result.replace(
                new RegExp(
                    `(compteur\\s+(?:individuel\\s+)?n[°o]?\\s*)${this.escapeRegExp(electricityField.value)}`,
                    "gi"
                ),
                "$1{{electricity_meter_number}}"
            );
        }


        // -----------------------------------------------------
        // COMPTEUR EAU
        // -----------------------------------------------------

        const waterField =
            fields.find(
                field =>
                    field.code ===
                    "water_meter_number"
            );

        if (
            waterField &&
            waterField.value
        ) {

            result = result.replace(
                new RegExp(
                    `(compteur\\s+(?:d['’]eau\\s+)?(?:n[°o]?\\s*)?)${this.escapeRegExp(waterField.value)}`,
                    "gi"
                ),
                "$1{{water_meter_number}}"
            );
        }


        // -----------------------------------------------------
        // CHARGES COMMUNES
        // -----------------------------------------------------

        const chargesTerm =
            terms.find(
                term =>
                    term.code ===
                    "common_charges_amount"
            );

        if (
            chargesTerm &&
            chargesTerm.default_value !== null &&
            chargesTerm.default_value !== undefined
        ) {

            const amount =
                this.parseMoney(
                    chargesTerm.default_value
                );

            if (amount !== null) {

                result =
                    this.replaceMoneyValue(
                        result,
                        amount,
                        "{{common_charges_amount}}"
                    );
            }
        }


        // =====================================================
        // 4. SIGNATURES
        // =====================================================

        const landlordField =
            fields.find(
                field =>
                    field.code === "landlord_name"
            );

        if (
            landlordField &&
            landlordField.value
        ) {

            result = result.replace(
                new RegExp(
                    `(LE\\s+BAILLEUR[\\s\\S]{0,120}?)${this.escapeRegExp(landlordField.value)}`,
                    "gi"
                ),
                `$1{{landlord_name}}`
            );
        }


        const tenantField =
            fields.find(
                field =>
                    field.code === "tenant_name"
            );

        if (
            tenantField &&
            tenantField.value
        ) {

            result = result.replace(
                new RegExp(
                    `(LA\\s+LOCATAIRE[\\s\\S]{0,120}?)${this.escapeRegExp(tenantField.value)}`,
                    "i"
                ),
                `$1{{tenant_name}}`
            );
        }

        // -----------------------------------------------------
        // NOM DU LOCATAIRE DANS LA DÉSIGNATION DU BIEN
        // Exemple : "à Mme Fatou Dieng"
        // -----------------------------------------------------

        const tenantDesignationField =
            fields.find(
                field =>
                    field.code === "tenant_name"
            );

        if (
            tenantDesignationField &&
            tenantDesignationField.value
        ) {

            result = result.replace(
                new RegExp(
                    `(à\\s+(?:Mme|M\\.?|Madame)\\s+)${this.escapeRegExp(tenantDesignationField.value)}`,
                    "gi"
                ),
                "$1{{tenant_name}}"
            );
        }

        // -----------------------------------------------------
        // VILLE DANS "FAIT À DAKAR, LE ..."
        // -----------------------------------------------------

        const buildingCityField =
            fields.find(
                field =>
                    field.code === "building_city"
            );

        if (
            buildingCityField &&
            buildingCityField.value
        ) {

            result = result.replace(
                new RegExp(
                    `(fait\\s+à\\s+)${this.escapeRegExp(buildingCityField.value)}`,
                    "gi"
                ),
                "$1{{building_city}}"
            );
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
    // DÉTECTION DE LA STRUCTURE / MISE EN PAGE
    // =========================================================

    static detectLayout(text = "", clauses = []) {

        const normalized = this.normalizeSearchText(text);

        const sections = [];

        const has = (...keywords) =>
            keywords.some(keyword =>
                normalized.includes(
                    this.normalizeSearchText(keyword)
                )
            );

        // ---------------------------------------------------------
        // EN-TÊTE
        // ---------------------------------------------------------

        if (
            has(
                "agence immobilière",
                "agence immobiliere",
                "agence test"
            )
        ) {
            sections.push({
                type: "HEADER"
            });
        }

        // ---------------------------------------------------------
        // TITRE
        // ---------------------------------------------------------

        if (
            has(
                "contrat de location",
                "contrat de bail"
            )
        ) {
            sections.push({
                type: "TITLE"
            });
        }

        // ---------------------------------------------------------
        // PARTIES
        // ---------------------------------------------------------

        if (
            has(
                "entre les soussignés",
                "entre les soussignes",
                "bailleur",
                "locataire",
                "preneur"
            )
        ) {
            sections.push({
                type: "PARTIES"
            });
        }

        // ---------------------------------------------------------
        // LOGEMENT
        // ---------------------------------------------------------

        if (
            has(
                "logement",
                "appartement",
                "immeuble",
                "résidence",
                "residence"
            )
        ) {
            sections.push({
                type: "PROPERTY"
            });
        }

        // ---------------------------------------------------------
        // DURÉE
        // ---------------------------------------------------------

        if (
            has(
                "durée",
                "duree",
                "durée du bail",
                "duree du bail",
                "prenant effet",
                "échéance",
                "echeance"
            )
        ) {
            sections.push({
                type: "DURATION"
            });
        }

        // ---------------------------------------------------------
        // LOYER
        // ---------------------------------------------------------

        if (
            has(
                "loyer",
                "loyer mensuel"
            )
        ) {
            sections.push({
                type: "RENT"
            });
        }

        // ---------------------------------------------------------
        // DÉTAIL DU LOYER
        // ---------------------------------------------------------

        if (
            has(
                "charges communes",
                "total mensuel",
                "dépôt de garantie",
                "depot de garantie",
                "caution"
            )
        ) {
            sections.push({
                type: "RENT_BREAKDOWN"
            });
        }

        // ---------------------------------------------------------
        // CONDITIONS
        // ---------------------------------------------------------

        if (
            has(
                "charges et conditions",
                "charges et conditions :"
            )
        ) {
            sections.push({
                type: "CONDITIONS"
            });
        }

        // ---------------------------------------------------------
        // ARTICLES
        // ---------------------------------------------------------

        if (
            clauses &&
            Array.isArray(clauses) &&
            clauses.length > 0
        ) {
            sections.push({
                type: "ARTICLES"
            });
        }

        // ---------------------------------------------------------
        // CLAUSES RÉSOLUTOIRES
        // ---------------------------------------------------------

        if (
            has(
                "clauses résolutoires",
                "clauses resolutoires",
                "clause résolutoire",
                "clause resolutoire"
            )
        ) {
            sections.push({
                type: "RESOLUTORY_CLAUSES"
            });
        }

        // ---------------------------------------------------------
        // ÉLECTION DE DOMICILE
        // ---------------------------------------------------------

        if (
            has(
                "élection de domicile",
                "election de domicile",
                "domicile"
            )
        ) {
            sections.push({
                type: "DOMICILE"
            });
        }

        // ---------------------------------------------------------
        // ENREGISTREMENT
        // ---------------------------------------------------------

        if (
            has(
                "enregistrement",
                "enregistré",
                "enregistre"
            )
        ) {
            sections.push({
                type: "REGISTRATION"
            });
        }

        // ---------------------------------------------------------
        // PRÉAVIS
        // ---------------------------------------------------------

        if (
            has(
                "préavis",
                "preavis"
            )
        ) {
            sections.push({
                type: "NOTICE"
            });
        }

        // ---------------------------------------------------------
        // SIGNATURES
        // ---------------------------------------------------------

        if (
            has(
                "signature",
                "signatures",
                "le bailleur",
                "le locataire",
                "le preneur"
            )
        ) {
            sections.push({
                type: "SIGNATURES"
            });
        }

        // ---------------------------------------------------------
        // FALLBACK
        // ---------------------------------------------------------

        if (sections.length === 0) {

            sections.push(
                {
                    type: "HEADER"
                },
                {
                    type: "TITLE"
                },
                {
                    type: "PARTIES"
                },
                {
                    type: "PROPERTY"
                },
                {
                    type: "DURATION"
                },
                {
                    type: "RENT"
                },
                {
                    type: "RENT_BREAKDOWN"
                },
                {
                    type: "CONDITIONS"
                },
                {
                    type: "ARTICLES"
                },
                {
                    type: "SIGNATURES"
                }
            );
        }

        return {
            version: 1,
            page_format: "A4",
            orientation: "portrait",
            sections
        };
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
                    clauses: [],
                    layout: {
                        version: 2,
                        page_format: "A4",
                        orientation: "portrait",
                        adaptive: true,
                        sections: []
                    }
                }
            };
        }


        // -----------------------------------------------------
        // NETTOYAGE
        // -----------------------------------------------------

        const cleanedText =
            this.cleanDocumentText(
                extraction.text
            );


        // -----------------------------------------------------
        // ANALYSE
        // -----------------------------------------------------

        const documentType =
            this.detectDocumentType(
                cleanedText
            );

        const fields =
            this.detectFields(
                cleanedText
            );

        const terms =
            this.detectTerms(
                cleanedText
            );

        const clauses =
            this.detectClauses(
                cleanedText,
                fields,
                terms
            );

        const parameterizedText =
            this.parameterizeText(
                cleanedText,
                fields,
                terms
            );

        const layout =
            this.detectLayout(
                cleanedText,
                clauses,
                fields,
                terms
            );


        // -----------------------------------------------------
        // RÉSULTAT
        // -----------------------------------------------------

        return {

            status: "ANALYZED",

            document: {

                pages:
                    extraction.pages,

                has_text:
                    true,

                text_length:
                    cleanedText.length,

                text:
                    cleanedText
            },

            analysis: {

                document_type:
                    documentType,

                fields,

                terms,

                clauses,

                source_text:
                    parameterizedText,

                layout
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

    // =========================================================
    // NORMALISATION AVANCÉE
    // =========================================================

    static normalizeForSearch(text = "") {

        return String(text)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/\u00A0/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[ \t]+/g, " ")
            .replace(/\n[ \t]+/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .trim();

    }


    // =========================================================
    // TEXTE EN LIGNES
    // =========================================================

    static getLines(text = "") {

        return String(text)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .map(line =>
                line
                    .replace(/\u00A0/g, " ")
                    .replace(/[ \t]+/g, " ")
                    .trim()
            )
            .filter(Boolean);

    }

    // =========================================================
    // EXTRACTION FLEXIBLE APRÈS UN LABEL
    // =========================================================

    static extractLabeledValue(
        text,
        labels = [],
        options = {}
    ) {

        const {
            maxLength = 300,
            multiline = false
        } = options;

        if (!text || !labels.length) {
            return null;
        }

        const lines = this.getLines(text);

        const normalizedLabels =
            labels.map(label => ({
                original: label,
                normalized: this.normalizeForSearch(label)
            }));


        // =====================================================
        // RECHERCHE LIGNE PAR LIGNE
        // =====================================================

        for (let i = 0; i < lines.length; i++) {

            const line = lines[i];

            const normalizedLine =
                this.normalizeForSearch(line);

            for (const label of normalizedLabels) {

                if (
                    !normalizedLine.startsWith(
                        label.normalized
                    )
                ) {
                    continue;
                }


                // =================================================
                // CALCUL DE LA VALEUR DANS LA LIGNE ORIGINALE
                // =================================================

                const labelRegex =
                    new RegExp(
                        `^${this.escapeRegExp(label.original)}\\s*[:\\-–—]?\\s*`,
                        "i"
                    );

                const match =
                    line.match(labelRegex);


                if (match) {

                    const value =
                        line
                            .substring(match[0].length)
                            .trim();

                    if (value) {

                        return this.cleanValue(
                            value
                        ).substring(0, maxLength);

                    }
                }


                // =================================================
                // CAS : VALEUR SUR LA LIGNE SUIVANTE
                // =================================================

                if (
                    multiline &&
                    lines[i + 1]
                ) {

                    return this.cleanValue(
                        lines[i + 1]
                    ).substring(0, maxLength);

                }
            }
        }


        // =====================================================
        // FALLBACK REGEX
        // =====================================================

        const escapedLabels =
            labels
                .map(label =>
                    this.escapeRegExp(label)
                )
                .join("|");

        if (!escapedLabels) {
            return null;
        }


        const regex =
            new RegExp(
                `(?:${escapedLabels})\\s*[:\\-–—]?\\s*([^\\n]{1,${maxLength}})`,
                "i"
            );


        const match =
            text.match(regex);

        if (!match) {
            return null;
        }


        return this.cleanValue(
            match[1]
        );
    }
   
}

module.exports = DocumentAIService;