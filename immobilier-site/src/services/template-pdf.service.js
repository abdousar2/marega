const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

class TemplatePDFService {

    // =========================================================
    // RÉSOUDRE LE CHEMIN DU LOGO
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
    // FORMATER UNE DATE
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
    // REMPLACER LES VARIABLES ABSENTES PAR UN TEXTE PROPRE
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

            apartment_surface:
                "Surface non renseignée",

            payment_method:
                "Mode de paiement non renseigné",

            electricity_meter_number:
                "Compteur électrique non renseigné",

            water_meter_number:
                "Compteur d'eau non renseigné"

        };


        return text.replace(
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

    static cleanRenderedClause(text = "") {

        return text
            .replace(
                /Pour la présente simulation,\s*/gi,
                ""
            )
            .replace(
                /\s{2,}/g,
                " "
            )
            .trim();
    }

    


    // =========================================================
    // GÉNÉRER LE PDF
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
            renderedResult.context || {};

        const clauses =
            renderedResult.clauses || [];


        // =====================================================
        // DOSSIER DE SORTIE
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
        // NOM DU FICHIER
        // =====================================================

        const contractNumber =
            context.lease?.contract_number ||
            renderedResult.lease?.contract_number ||
            `lease-${Date.now()}`;

        const filename =
            `${contractNumber}-template.pdf`;

        const outputPath =
            path.join(
                contractsDir,
                filename
            );


        // =====================================================
        // PDF
        // =====================================================

        const doc =
            new PDFDocument({
                size: "A4",
                margin: 50,
                bufferPages: true
            });


        const stream =
            fs.createWriteStream(
                outputPath
            );


        return new Promise(
            (resolve, reject) => {

                stream.on(
                    "finish",
                    () => {

                        resolve({
                            success: true,
                            filename,
                            path: `/contracts/${filename}`,
                            absolutePath: outputPath,
                            contract_number:
                                contractNumber
                        });

                    }
                );


                stream.on(
                    "error",
                    reject
                );


                doc.pipe(stream);


                // =================================================
                // IDENTITÉ AGENCE
                // =================================================

                const agency =
                    context.agency || {};

                const agencyName =
                    agency.name ||
                    "Agence immobilière";

                const agencyType =
                    agency.type ||
                    "";

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


                // =================================================
                // LOGO
                // =================================================

                const logoPath =
                    this.resolveLogoPath(
                        agency.logo_path
                    );

                if (logoPath) {

                    try {

                        doc.image(
                            logoPath,
                            50,
                            40,
                            {
                                fit: [
                                    90,
                                    60
                                ],
                                align: "left",
                                valign: "center"
                            }
                        );

                    } catch (error) {

                        console.error(
                            "Erreur chargement logo :",
                            error.message
                        );
                    }
                }


                // =================================================
                // EN-TÊTE
                // =================================================

                doc
                    .fontSize(16)
                    .font("Helvetica-Bold")
                    .text(
                        agencyName,
                        150,
                        42,
                        {
                            width: 395
                        }
                    );

                if (agencyType) {

                    doc
                        .fontSize(9)
                        .font("Helvetica")
                        .fillColor("#555555")
                        .text(
                            agencyType,
                            150,
                            63,
                            {
                                width: 395
                            }
                        );
                }


                const contactParts = [];

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

                if (contactParts.length) {

                    doc
                        .fontSize(8)
                        .fillColor("#555555")
                        .text(
                            contactParts.join(" • "),
                            150,
                            78,
                            {
                                width: 395
                            }
                        );
                }


                doc
                    .strokeColor("#D0D5DD")
                    .moveTo(
                        50,
                        110
                    )
                    .lineTo(
                        545,
                        110
                    )
                    .stroke();


                // =================================================
                // TITRE
                // =================================================

                doc
                    .fillColor("#111827")
                    .fontSize(18)
                    .font("Helvetica-Bold")
                    .text(
                        renderedResult.template?.name ||
                        "Contrat de location",
                        50,
                        130,
                        {
                            align: "center",
                            width: 495
                        }
                    );


                doc
                    .fontSize(9)
                    .font("Helvetica")
                    .fillColor("#666666")
                    .text(
                        `Contrat N° ${contractNumber}`,
                        50,
                        156,
                        {
                            align: "center",
                            width: 495
                        }
                    );


                // =================================================
                // INFORMATIONS RAPIDES
                // =================================================

                const tenantName =
                    context.tenant_name ||
                    context.tenant?.name ||
                    "";

                const buildingName =
                    context.building_name ||
                    context.building?.name ||
                    "";

                const apartmentNumber =
                    context.apartment_number ||
                    context.apartment?.number ||
                    "";


                doc
                    .roundedRect(
                        50,
                        185,
                        495,
                        70,
                        8
                    )
                    .fillAndStroke(
                        "#F8FAFC",
                        "#E5E7EB"
                    );


                doc
                    .fillColor("#111827")
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .text(
                        "LOCATAIRE",
                        65,
                        200
                    );

                doc
                    .font("Helvetica")
                    .fontSize(10)
                    .text(
                        tenantName,
                        65,
                        217
                    );


                doc
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .text(
                        "LOGEMENT",
                        245,
                        200
                    );

                doc
                    .font("Helvetica")
                    .fontSize(10)
                    .text(
                        `${buildingName} • ${apartmentNumber}`,
                        245,
                        217,
                        {
                            width: 280
                        }
                    );


                // =================================================
                // CLAUSES
                // =================================================

                let firstClause = true;

                for (
                    const clause
                    of clauses
                ) {

                    if (!clause.enabled) {
                        continue;
                    }

                    if (!firstClause) {

                        doc.moveDown(0.5);
                    }

                    firstClause = false;


                    // -------------------------------------------------
                    // Vérifier l'espace disponible
                    // -------------------------------------------------

                    if (
                        doc.y > 710
                    ) {

                        doc.addPage();
                    }


                    // -------------------------------------------------
                    // TITRE ARTICLE
                    // -------------------------------------------------

                    doc
                        .font("Helvetica-Bold")
                        .fontSize(10.5)
                        .fillColor("#111827")
                        .text(
                            `Article ${clause.clause_order} — ${clause.title}`,
                            {
                                continued: false
                            }
                        );


                    doc.moveDown(0.25);


                    // -------------------------------------------------
                    // CONTENU
                    // -------------------------------------------------

                    const clauseText =
                        this.cleanRenderedClause(
                            this.replaceMissingVariables(
                                clause.content || ""
                            )
                        );

                    doc
                        .font("Helvetica")
                        .fontSize(9.5)
                        .fillColor("#333333")
                        .text(
                            clauseText,
                            {
                                width: 495,
                                align: "justify",
                                lineGap: 2
                            }
                        );


                    doc.moveDown(0.55);
                }


                // =================================================
                // SIGNATURES
                // =================================================

                if (
                    doc.y > 650
                ) {
                    doc.addPage();
                }


                doc
                    .moveDown(1)
                    .font("Helvetica")
                    .fontSize(9)
                    .fillColor("#333333")
                    .text(
                        `Fait à ${agencyCity || "________________"}, le ${this.formatDate(context.lease_start_date)}`,
                        {
                            align: "left"
                        }
                    );


                doc.moveDown(1);


                const signatureY =
                    doc.y;


                doc
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .text(
                        "LE BAILLEUR",
                        70,
                        signatureY,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .text(
                        "LA LOCATAIRE",
                        340,
                        signatureY,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .font("Helvetica")
                    .fontSize(9)
                    .text(
                        context.landlord_name ||
                        "",
                        70,
                        signatureY + 35,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .text(
                        tenantName,
                        340,
                        signatureY + 35,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .fontSize(8)
                    .fillColor("#666666")
                    .text(
                        "Mention : « Lu et approuvé »",
                        70,
                        signatureY + 58,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .text(
                        "Mention : « Lu et approuvé »",
                        340,
                        signatureY + 58,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .fontSize(8)
                    .text(
                        "Signature : ____________________",
                        70,
                        signatureY + 90,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                doc
                    .text(
                        "Signature : ____________________",
                        340,
                        signatureY + 90,
                        {
                            width: 180,
                            align: "center"
                        }
                    );


                // =================================================
                // PIED DE PAGE
                // =================================================

                const range =
                    doc.bufferedPageRange();


                for (
                    let i = range.start;
                    i < range.start + range.count;
                    i++
                ) {

                    doc.switchToPage(i);


                    const footerY =
                        doc.page.height - 35;


                    doc
                        .fontSize(7.5)
                        .font("Helvetica")
                        .fillColor("#777777")
                        .text(
                            `${agencyName} • Gestion Immobilière • ${agencyCity ? `${agencyCity} - ` : ""}${agencyCountry}`,
                            50,
                            footerY,
                            {
                                width: 495,
                                align: "center"
                            }
                        );
                }


                doc.end();
            }
        );
    }
}

module.exports =
    TemplatePDFService;