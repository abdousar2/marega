const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

class TemplatePDFService {

    // =========================================================
    // LOGO
    // =========================================================

    static resolveLogoPath(logoPath) {

        if (!logoPath) {
            return null;
        }

        const cleanPath =
            String(logoPath)
                .replace(/^[/\\]+/, "");

        const absolutePath =
            path.resolve(
                process.cwd(),
                cleanPath
            );

        if (!fs.existsSync(absolutePath)) {
            return null;
        }

        return absolutePath;
    }


    // =========================================================
    // DATE
    // =========================================================

    static formatDate(value) {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (Number.isNaN(date.getTime())) {
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
    // HTML ESCAPE
    // =========================================================

    static escapeHtml(value = "") {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // =========================================================
    // NORMALISER UNE CHAÎNE
    // =========================================================

    static normalize(value = "") {

        return String(value)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }


    // =========================================================
    // VALEURS MANQUANTES
    // =========================================================

    static replaceMissingVariables(text = "") {

        const labels = {

            landlord_address:
                "Adresse non renseignée",

            landlord_phone:
                "Téléphone non renseigné",

            landlord_email:
                "Email non renseigné",

            tenant_birth_date:
                "Date de naissance non renseignée",

            tenant_birth_place:
                "Lieu de naissance non renseigné",

            tenant_phone:
                "Téléphone non renseigné",

            tenant_email:
                "Email non renseigné",

            tenant_identity_number:
                "Numéro de pièce non renseigné",

            apartment_surface:
                "Surface non renseignée",

            payment_method:
                "Mode de paiement non renseigné",

            electricity_meter_number:
                "Compteur électrique non renseigné",

            water_meter_number:
                "Compteur d'eau non renseigné",

            building_address:
                "Adresse non renseignée",

            building_city:
                "Ville non renseignée",

            building_country:
                "Pays non renseigné"
        };


        return String(text).replace(
            /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
            (
                fullMatch,
                variable
            ) => {

                return (
                    labels[variable] ||
                    "Information non renseignée"
                );
            }
        );
    }


    // =========================================================
    // RÉCUPÉRER UNE VARIABLE DU CONTEXTE
    // =========================================================

    static resolveValue(
        context,
        variable
    ) {

        if (!context || !variable) {
            return null;
        }

        const parts =
            String(variable)
                .split(".")
                .filter(Boolean);

        let current =
            context;

        for (const part of parts) {

            if (
                current === null ||
                current === undefined
            ) {
                return null;
            }

            current =
                current[part];
        }

        return current;
    }


    // =========================================================
    // REMPLACER {{variables}}
    // =========================================================

    static renderVariables(
        text = "",
        context = {}
    ) {

        if (!text) {
            return "";
        }

        let result =
            String(text);

        result =
            result.replace(
                /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
                (
                    fullMatch,
                    variable
                ) => {

                    const value =
                        this.resolveValue(
                            context,
                            variable
                        );

                    if (
                        value === null ||
                        value === undefined ||
                        value === ""
                    ) {
                        return this.replaceMissingVariables(
                            fullMatch
                        );
                    }

                    return String(value);
                }
            );

        return result;
    }


    // =========================================================
    // TEXTE → HTML
    // =========================================================

    static textToHtml(
        text = "",
        context = {}
    ) {

        const rendered =
            this.renderVariables(
                text,
                context
            );

        const safe =
            this.escapeHtml(
                this.replaceMissingVariables(
                    rendered
                )
            );

        return safe
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(
                /\n{2,}/g,
                "</p><p>"
            )
            .replace(
                /\n/g,
                "<br>"
            );
    }


    // =========================================================
    // MONNAIE
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

        if (!Number.isFinite(number)) {
            return String(value);
        }

        return (
            number
                .toLocaleString("fr-FR")
                .replace(/\u00A0/g, " ")
            + " FCFA"
        );
    }


    // =========================================================
    // CSS GÉNÉRIQUE
    // =========================================================

    static getContractCSS() {

        return `

        @page {
            size: A4 portrait;
            margin: 16mm 15mm 18mm 15mm;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            background: #ffffff;
        }

        body {
            font-family:
                Arial,
                Helvetica,
                sans-serif;

            color: #171717;

            font-size: 10.5px;

            line-height: 1.45;
        }

        .document {
            width: 100%;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .header {
            display: grid;

            grid-template-columns:
                78px
                1fr
                170px;

            gap: 14px;

            align-items: center;

            padding-bottom: 12px;

            border-bottom:
                1.5px solid #2563eb;

            margin-bottom: 18px;
        }

        .logo {
            width: 68px;
            height: 52px;

            object-fit: contain;

            display: block;
        }

        .agency-center {
            text-align: center;
        }

        .agency-type {
            font-size: 11px;
            font-weight: 700;

            color: #1e3a8a;

            text-transform: uppercase;
        }

        .agency-name {
            margin-top: 2px;

            font-size: 16px;
            font-weight: 700;

            text-transform: uppercase;
        }

        .agency-contact {
            margin-top: 4px;

            font-size: 8px;

            color: #555;

            line-height: 1.35;
        }

        .agency-box {
            min-height: 56px;

            border:
                1px solid #94a3b8;

            padding: 8px;

            text-align: center;

            font-size: 8px;
        }

        .agency-box strong {
            display: block;

            font-size: 8px;

            margin-bottom: 2px;
        }


        /* =====================================================
           TITRE
        ===================================================== */

        .title-block {
            text-align: center;

            margin:
                6px 0 18px;
        }

        .title-block h1 {
            margin: 0;

            font-size: 18px;

            font-weight: 700;

            text-transform: uppercase;
        }

        .contract-number {
            margin-top: 4px;

            font-size: 8px;

            color: #666;
        }


        /* =====================================================
           SECTION
        ===================================================== */

        .section {
            margin-bottom: 11px;

            page-break-inside: auto;
        }

        .section-title {
            margin:
                0 0 6px;

            font-size: 10.5px;

            font-weight: 700;

            text-transform: uppercase;

            text-decoration: underline;
        }

        .section-content {
            margin: 0;

            font-size: 10px;

            line-height: 1.48;

            text-align: justify;

            white-space: normal;
        }


        /* =====================================================
           INTRO / PARTIES / PROPERTY / ETC.
        ===================================================== */

        .rich-content {
            margin-bottom: 10px;
        }

        .rich-content p {
            margin:
                0 0 7px;
        }


        /* =====================================================
           ARTICLES
        ===================================================== */

        .articles {
            margin-top: 4px;
        }

        .article {
            margin-bottom: 9px;

            page-break-inside: auto;
        }

        .article-title {
            margin:
                0 0 3px;

            font-size: 9.6px;

            line-height: 1.35;

            font-weight: 700;
        }

        .article-content {
            margin: 0;

            font-size: 9.4px;

            line-height: 1.42;

            text-align: justify;
        }


        /* =====================================================
           TABLEAU FINANCIER
        ===================================================== */

        .financial-table {
            width: 100%;

            border-collapse:
                collapse;

            margin:
                7px auto 10px;

            font-size: 9px;
        }

        .financial-table td {
            padding:
                3px 7px;
        }

        .financial-table td:last-child {
            text-align: right;

            font-weight: 600;
        }

        .financial-total td {
            padding-top: 6px;

            font-weight: 700;

            border-top:
                1px solid #333;
        }


        /* =====================================================
           CUSTOM
        ===================================================== */

        .custom-section {
            margin-bottom: 11px;
        }


        /* =====================================================
           SIGNATURES
        ===================================================== */

        .signature-section {
            margin-top: 25px;

            page-break-inside: avoid;
        }

        .signature-date {
            margin-bottom: 24px;

            font-size: 9px;
        }

        .signature-grid {
            display: grid;

            grid-template-columns:
                1fr 1fr;

            gap: 80px;
        }

        .signature-column {
            text-align: center;

            min-height: 110px;
        }

        .signature-role {
            font-size: 9px;

            font-weight: 700;

            text-decoration: underline;
        }

        .signature-name {
            margin-top: 32px;

            font-size: 9px;
        }

        .signature-line {
            margin-top: 38px;

            border-bottom:
                1px solid #555;
        }

        /* =====================================================
        CONTENU GÉNÉRIQUE
        ===================================================== */

        .document-content {
            width: 100%;
        }

        .document-content .section-content {
            margin: 0 0 8px 0;

            font-size: 10px;

            line-height: 1.48;

            text-align: justify;
        }

        .document-content .section {
            margin-bottom: 6px;
        }

        .document-content .article {
            margin-bottom: 7px;
        }

        .document-content .article-title {
            margin: 0 0 3px 0;

            font-size: 9.6px;

            line-height: 1.35;

            font-weight: 700;

            color: #111827;
        }

        .document-content .section-title {
            margin: 8px 0 4px 0;

            font-size: 10px;

            line-height: 1.35;

            font-weight: 700;

            text-transform: uppercase;

            text-decoration: underline;

            color: #111827;
        }

        /* =====================================================
        GRANDES SECTIONS
        ===================================================== */

        .document-content .major-section {
            margin-top: 10px;
            margin-bottom: 5px;
        }

        .document-content .major-section:first-child {
            margin-top: 0;
        }


        /* =====================================================
        SAUT DE PAGE INTELLIGENT
        ===================================================== */

        .force-page-break {
            break-before: page;

            page-break-before: always;
        }


        /* =====================================================
        TEXTE
        ===================================================== */

        .document-content .section-content {
            margin: 0 0 6px 0;

            font-size: 10.5px;

            line-height: 1.5;

            text-align: justify;

            orphans: 3;

            widows: 3;
        }


        /* =====================================================
        ARTICLES
        ===================================================== */

        .document-content .article {
            margin-bottom: 5px;

            page-break-inside: auto;
        }

        .document-content .article-title {
            margin:
                6px 0 2px 0;

            font-size: 9.8px;

            font-weight: 700;

            line-height: 1.35;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .footer {
            position: fixed;

            left: 0;
            right: 0;

            bottom: -11mm;

            text-align: center;

            font-size: 7px;

            color: #888;

            border-top:
                1px solid #e5e7eb;

            padding-top: 4px;
        }


        /* =====================================================
           IMPRESSION
        ===================================================== */

        @media print {

            .section,
            .article,
            .signature-section {
                page-break-inside: auto;
            }
        }

        `;
    }


    // =========================================================
    // ARTICLE → HTML
    // =========================================================

    static buildArticleHtml(
        clause,
        context
    ) {

        if (
            !clause ||
            clause.enabled === false
        ) {
            return "";
        }

        const number =
            clause.clause_order !== undefined
                ? clause.clause_order
                : "";

        const title =
            clause.title ||
            "";

        const content =
            this.textToHtml(
                clause.content || "",
                context
            );

        return `

            <article class="article">

                <h3 class="article-title">
                    ${
                        number !== ""
                            ? `Article ${this.escapeHtml(number)} — `
                            : ""
                    }
                    ${this.escapeHtml(title)}
                </h3>

                <p class="article-content">
                    ${content}
                </p>

            </article>

        `;
    }


    // =========================================================
    // NORMALISER UN TYPE DE SECTION
    // =========================================================

    static sectionType(
        section
    ) {

        return this.normalize(
            section?.type || ""
        );
    }


    // =========================================================
    // BUILD HTML
    // =========================================================

    static buildHtml(renderedResult) {

        const context =
            renderedResult.context || {};

        const template =
            renderedResult.template || {};

        const definition =
            template.definition || {};

        const layout =
            renderedResult.layout ||
            definition.layout ||
            {};

        const sections =
            Array.isArray(layout.sections)
                ? layout.sections
                : [];

        // =========================================================
        // AGENCE
        // =========================================================

        const agency =
            context.agency || {};

        const agencyName =
            agency.name ||
            "Agence immobilière";

        const agencyType =
            agency.type ||
            "Agence immobilière";

        const agencyPhone =
            agency.phone ||
            "";

        const agencyEmail =
            agency.email ||
            "";

        const agencyCity =
            agency.city ||
            "";

        const agencyCountry =
            agency.country ||
            "Sénégal";


        // =========================================================
        // NUMÉRO DOCUMENT
        // =========================================================

        const documentNumber =
            context.lease?.contract_number ||
            renderedResult.lease?.contract_number ||
            "";


        // =========================================================
        // TITRE INTELLIGENT
        // =========================================================

        const documentType =
            this.normalize(
                template.document_type ||
                definition.document_type ||
                "DOCUMENT"
            );


        const titleMap = {

            lease_contract:
                "CONTRAT DE LOCATION",

            receipt:
                "REÇU",

            notice:
                "AVIS",

            invoice:
                "FACTURE",

            mandate:
                "MANDAT",

            agreement:
                "CONVENTION",

            contract:
                "CONTRAT"
        };


        let documentTitle =
            titleMap[documentType] ||
            "";


        if (!documentTitle) {

            const titleSection =
                sections.find(
                    section =>
                        this.normalize(
                            section?.type || ""
                        ) === "title"
                );

            documentTitle =
                titleSection?.title ||
                "DOCUMENT";
        }


        // =========================================================
        // LOGO
        // =========================================================

        let logoHtml = "";

        const logoPath =
            this.resolveLogoPath(
                agency.logo_path
            );

        if (logoPath) {

            try {

                const logoBuffer =
                    fs.readFileSync(
                        logoPath
                    );

                const extension =
                    path.extname(
                        logoPath
                    ).toLowerCase();

                let mimeType =
                    "image/jpeg";

                if (extension === ".png") {
                    mimeType = "image/png";
                }

                if (extension === ".webp") {
                    mimeType = "image/webp";
                }

                logoHtml = `
                    <img
                        class="logo"
                        src="data:${mimeType};base64,${logoBuffer.toString("base64")}"
                        alt="Logo"
                    />
                `;

            } catch (error) {

                console.error(
                    "Erreur chargement logo :",
                    error.message
                );
            }
        }


        // =========================================================
        // TEXTE SOURCE PARAMÉTRÉ
        // =========================================================

        let sourceText =
            definition.source_text ||
            definition.document?.source_text ||
            "";


        /*
        * Si l'ancien template ne possède pas encore source_text,
        * on utilise le texte original comme secours.
        */
        if (!sourceText) {

            sourceText =
                definition.document?.text ||
                "";
        }


        // =========================================================
        // REMPLACEMENT DES VARIABLES
        // =========================================================

        sourceText =
            this.renderVariables(
                sourceText,
                context
            );

        sourceText =
            this.replaceMissingVariables(
                sourceText
            );


        // =========================================================
        // NETTOYAGE DU TEXTE SOURCE
        // =========================================================

        sourceText =
            String(sourceText)
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .trim();


        // =========================================================
        // LIGNES
        // =========================================================

        let lines =
            sourceText
                .split("\n")
                .map(
                    line =>
                        line
                            .replace(/\s+/g, " ")
                            .trim()
                )
                .filter(Boolean);


        // =========================================================
        // RETIRER LES ÉLÉMENTS DE HEADER DUPLIQUÉS
        // =========================================================

        const firstLinesToIgnore =
            new Set([
                this.normalize(agencyName),
                this.normalize(agencyType),
                this.normalize(
                    `${agencyCity}, ${agencyCountry}`
                ),
                this.normalize(documentTitle)
            ]);


        lines =
            lines.filter(
                (line, index) => {

                    if (index > 8) {
                        return true;
                    }

                    return !firstLinesToIgnore.has(
                        this.normalize(line)
                    );
                }
            );


        // =========================================================
        // CONSTRUIRE LE CORPS DU DOCUMENT
        // =========================================================

        let bodyHtml = "";


        // ---------------------------------------------------------
        // MOTIFS DE GRANDES SECTIONS
        // ---------------------------------------------------------

        const majorSectionPatterns = [

            /^entre\s+les\s+soussign[eé]s/i,

            /^identification\s+des\s+parties/i,

            /^d[eé]signation\s+du\s+bien/i,

            /^objet\s+du\s+contrat/i,

            /^objet\s+du\s+bail/i,

            /^description\s+du\s+bien/i,

            /^destination\s+du\s+logement/i,

            /^dur[eé]e/i,

            /^loyer/i,

            /^conditions/i,

            /^charges/i,

            /^modalit[eé]s/i,

            /^articles?/i,

            /^clauses?\s+r[eé]solutoires/i,

            /^election\s+de\s+domicile/i,

            /^enregistrement/i,

            /^pr[eé]avis/i,

            /^r[eé]siliation/i,

            /^obligations?/i,

            /^responsabilit[eé]s?/i,

            /^r[eé]mun[eé]ration/i,

            /^honoraires?/i,

            /^confidentialit[eé]/i,

            /^signature/i
        ];


        // ---------------------------------------------------------
        // FONCTION : TITRE DE SECTION
        // ---------------------------------------------------------

        const isMajorHeading = (line) => {

            const clean =
                String(line)
                    .trim();

            if (!clean) {
                return false;
            }

            // Cas : "1. IDENTIFICATION DES PARTIES"
            if (
                /^\d+\.\s+[A-ZÀ-ŸÉÈÊËÎÏÔÖÙÛÜÇ][A-ZÀ-ŸÉÈÊËÎÏÔÖÙÛÜÇ0-9\s'’:&/-]{2,100}$/
                    .test(clean)
            ) {
                return true;
            }

            // Cas : "ARTICLE 1"
            if (
                /^article\s+\d+/i.test(clean)
            ) {
                return true;
            }

            // Cas : titre en majuscules court
            if (
                clean === clean.toUpperCase() &&
                clean.length <= 110 &&
                /[A-ZÀ-Ÿ]/.test(clean)
            ) {
                return true;
            }

            // Cas : mots-clés connus
            return majorSectionPatterns.some(
                regex => regex.test(clean)
            );
        };


        // ---------------------------------------------------------
        // FONCTION : DÉTERMINER SI NOUVELLE PAGE
        // ---------------------------------------------------------

        const needsPageBreak =
            (line) => {

                const normalized =
                    this.normalize(
                        line
                    );

                return (

                    normalized.includes(
                        "clauses resolutoires"
                    ) ||

                    normalized.includes(
                        "election de domicile"
                    ) ||

                    normalized.includes(
                        "enregistrement"
                    ) ||

                    normalized.includes(
                        "preavis"
                    ) ||

                    normalized.includes(
                        "signatures"
                    )
                );
            };


        // ---------------------------------------------------------
        // PARCOURS DU TEXTE
        // ---------------------------------------------------------

        for (
            const line of lines
        ) {

            const cleanLine =
                String(line)
                    .trim();


            if (!cleanLine) {
                continue;
            }


            // =====================================================
            // ARTICLE
            // =====================================================

            if (
                /^article\s+[0-9ivx]+/i.test(
                    cleanLine
                )
            ) {

                bodyHtml += `

                    <section class="article">

                        <h2 class="article-title">

                            ${this.escapeHtml(
                                cleanLine
                            )}

                        </h2>

                    </section>

                `;

                continue;
            }


            // =====================================================
            // GRANDE SECTION
            // =====================================================

            if (
                isMajorHeading(
                    cleanLine
                )
            ) {

                const pageBreak =
                    needsPageBreak(
                        cleanLine
                    );


                bodyHtml += `

                    <section
                        class="
                            section
                            major-section
                            ${pageBreak ? "force-page-break" : ""}
                        "
                    >

                        <h2 class="section-title">

                            ${this.escapeHtml(
                                cleanLine
                            )}

                        </h2>

                    </section>

                `;

                continue;
            }


            // =====================================================
            // PARAGRAPHE
            // =====================================================

            bodyHtml += `

                <p class="section-content">

                    ${this.escapeHtml(
                        cleanLine
                    )}

                </p>

            `;
        }


        // =========================================================
        // SI LE TEXTE SOURCE EST ABSENT
        // FALLBACK SUR LES CLAUSES
        // =========================================================

        if (!bodyHtml.trim()) {

            const clauses =
                Array.isArray(
                    renderedResult.clauses
                )
                    ? renderedResult.clauses
                    : [];


            for (
                const clause of clauses
            ) {

                if (
                    !clause ||
                    clause.enabled === false
                ) {
                    continue;
                }

                const title =
                    clause.title ||
                    "";

                const content =
                    this.renderVariables(
                        clause.content ||
                        "",
                        context
                    );


                bodyHtml += `

                    <section class="section article">

                        <h2 class="article-title">

                            ${
                                clause.clause_order
                                    ? `Article ${this.escapeHtml(
                                        clause.clause_order
                                    )} — `
                                    : ""
                            }

                            ${this.escapeHtml(
                                title
                            )}

                        </h2>


                        <p class="article-content">

                            ${this.escapeHtml(
                                content
                            )}

                        </p>

                    </section>

                `;
            }
        }


        // =========================================================
        // HEADER HTML
        // =========================================================

        const contactParts = [];

        if (agencyCity) {
            contactParts.push(
                `${agencyCity}, ${agencyCountry}`
            );
        }

        if (agencyPhone) {
            contactParts.push(
                `Tél. : ${agencyPhone}`
            );
        }

        if (agencyEmail) {
            contactParts.push(
                agencyEmail
            );
        }


        const contact =
            contactParts.join(" • ");


        const headerHtml = `

            <header class="header">

                <div>
                    ${logoHtml}
                </div>


                <div class="agency-center">

                    <div class="agency-type">

                        ${this.escapeHtml(
                            agencyType
                        )}

                    </div>


                    <div class="agency-name">

                        ${this.escapeHtml(
                            agencyName
                        )}

                    </div>


                    ${
                        contact
                            ? `
                                <div class="agency-contact">

                                    ${this.escapeHtml(
                                        contact
                                    )}

                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="agency-box">

                    <strong>

                        ${this.escapeHtml(
                            agencyType
                        )}

                    </strong>

                    ${this.escapeHtml(
                        agencyName
                    )}

                </div>

            </header>

        `;


        // =========================================================
        // FOOTER
        // =========================================================

        const footerText =
            [
                agencyName,
                agencyCity,
                agencyCountry
            ]
                .filter(Boolean)
                .join(" • ");


        // =========================================================
        // HTML FINAL
        // =========================================================

        return `

    <!DOCTYPE html>

    <html lang="fr">

    <head>

        <meta charset="UTF-8">

        <title>

            ${this.escapeHtml(
                documentTitle
            )}

        </title>


        <style>

            ${this.getContractCSS()}

        </style>

    </head>


    <body>

        <div class="document">


            ${headerHtml}


            <section class="title-block">

                <h1>

                    ${this.escapeHtml(
                        documentTitle
                    )}

                </h1>


                ${
                    documentNumber
                        ? `
                            <div class="contract-number">

                                Contrat N°
                                ${this.escapeHtml(
                                    documentNumber
                                )}

                            </div>
                        `
                        : ""
                }

            </section>


            <main class="document-content">

                ${bodyHtml}

            </main>


            <footer class="footer">

                ${this.escapeHtml(
                    footerText
                )}

            </footer>


        </div>

    </body>

    </html>

        `;
    }


    // =========================================================
    // GÉNÉRATION PDF
    // =========================================================

    static async generateFromRenderedResult(
        renderedResult
    ) {

        if (!renderedResult) {
            throw new Error(
                "Résultat de rendu manquant."
            );
        }


        if (!renderedResult.ready) {

            throw new Error(
                "Le document contient encore des variables obligatoires manquantes."
            );
        }


        const context =
            renderedResult.context ||
            {};


        const layout =
            renderedResult.layout ||
            {};


        const contractNumber =
            context.lease?.contract_number ||
            renderedResult.lease?.contract_number ||
            `DOC-${Date.now()}`;


        // =====================================================
        // DOSSIER
        // =====================================================

        const contractsDir =
            path.resolve(
                process.cwd(),
                "contracts"
            );


        if (!fs.existsSync(contractsDir)) {

            fs.mkdirSync(
                contractsDir,
                {
                    recursive: true
                }
            );
        }


        // =====================================================
        // FICHIER
        // =====================================================

        const filename =
            `${contractNumber}-template.pdf`;

        const outputPath =
            path.join(
                contractsDir,
                filename
            );


        // =====================================================
        // HTML
        // =====================================================

        const html =
            this.buildHtml(
                renderedResult
            );


        // =====================================================
        // PUPPETEER
        // =====================================================

        let browser = null;


        try {

            browser =
                await puppeteer.launch({

                    headless: true,

                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage"
                    ]
                });


            const page =
                await browser.newPage();


            await page.setContent(
                html,
                {
                    waitUntil:
                        "networkidle0"
                }
            );


            const orientation =
                String(
                    layout.orientation ||
                    "portrait"
                ).toLowerCase();


            await page.pdf({

                path:
                    outputPath,

                format:
                    layout.page_format === "A3"
                        ? "A3"
                        : layout.page_format === "LETTER"
                            ? "Letter"
                            : "A4",

                landscape:
                    orientation ===
                    "landscape",

                printBackground:
                    true,

                preferCSSPageSize:
                    true,

                margin: {

                    top:
                        "0mm",

                    right:
                        "0mm",

                    bottom:
                        "0mm",

                    left:
                        "0mm"
                }
            });


            await page.close();


            return {

                success: true,

                filename,

                path:
                    `/contracts/${filename}`,

                absolutePath:
                    outputPath,

                contract_number:
                    contractNumber
            };


        } catch (error) {

            console.error(
                "Erreur génération PDF Puppeteer :",
                error
            );

            throw error;


        } finally {

            if (browser) {

                await browser.close();
            }
        }
    }
}


module.exports =
    TemplatePDFService;