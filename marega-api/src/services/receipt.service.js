const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


const logo = path.join(
    __dirname,
    "../assets/logo-ibm-marega.png"
);

class ReceiptService {

    static async generateReceipt(payment) {

        const folder = path.join(__dirname, "../../receipts");

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        const filename = `RECU-${payment.id}.pdf`;

        const filepath = path.join(folder, filename);

        const doc = new PDFDocument({
            size: "A5",
            layout: "landscape",
            margin: 20
        });

        doc.pipe(fs.createWriteStream(filepath));

        const primary = "#1E3A8A";
        const gray = "#6B7280";


        //=====================
        // LOGO
        //=====================

        doc.image(logo, 55, 35, {
            width: 80
        });


        //=====================
        // EN-TETE
        //=====================

        doc
            .fillColor(primary)
            .font("Helvetica-Bold")
            .fontSize(18)
            .text("IBM MAREGA", 150, 38);

        doc
            .fontSize(8)
            .fillColor(gray)
            .text(
                "Agence Immobilière",
                150,
                65
            );

        doc
            .fontSize(8)
            .text(
                "RC : SN DKR. 1009. B. 6013 - NINEA : 004032570 - 80 Avenue Lamine Guèye   Tél.: 33 822 88 39 ",
                150,
                77
            );

        doc.moveTo(50,89)
            .lineTo(545,89)
            .lineWidth(2)
            .strokeColor(primary)
            .stroke();


        //=====================
        // TITRE
        //=====================

        doc
            .fillColor(primary)
            .font("Helvetica-Bold")
            .fontSize(18)
            .text(
                "QUITTANCE DE LOYER",
                50,
                100,
                {
                    align:"center"
                }
            );

        doc
            .fontSize(8)
            .fillColor("black")
            .text(
                `Référence : RECU-${payment.id}`,
                1,
                120,
                {
                    align:"center"
                }
            );

        //=====================
        // CARTE LOCATAIRE
        //=====================

        doc.roundedRect(
            50,
            130,
            200,
            70,
            10
        ).stroke();

        doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(primary)
        .text(
            "LOCATAIRE",
            65,
            135
        );

        doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("black");

        doc.text(
            `Nom : ${payment.tenant_name}`,
            65,
            155
        );

        doc.text(
            `Appartement : ${payment.apartment_number}`,
            65,
            170
        );

        doc.text(
            `Immeuble : ${payment.building_name}`,
            65,
            185
        );

        doc.roundedRect(
            310,
            130,
            200,
            70,
            10
        ).stroke();

        doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(primary)
        .text(
            "PAIEMENT",
            325,
            135
        );

        doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("black");

        doc.text(
            `Date : ${this.formatDate(payment.payment_date)}`,
            325,
            155
        );

        doc.text(
            `Mois : ${this.formatMonth(payment.payment_month)}`,
            325,
            170
        );

        doc.text(
            `Mode de paiement : ${payment.payment_method}`,
            325,
            185
        );

        //====================================
        // MONTANT ENCAISSÉ
        //====================================

        doc.roundedRect(50, 210, 460, 55, 12)
            .fillAndStroke("#EFF6FF", "#2563EB");

        doc
            .fillColor("#1D4ED8")
            .font("Helvetica-Bold")
            .fontSize(12)
            .text(
                "MONTANT ENCAISSÉ",
                50,
                215,
                {
                    width: 495,
                    align: "center"
                }
            );

        doc
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .fontSize(20)
            .text(
                `${this.money(payment.amount)} FCFA`,
                50,
                235,
                {
                    width: 495,
                    align: "center"
                }
            );

        //====================================
        // ATTESTATION
        //====================================

        doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(11)
            .text(
                "Nous certifions avoir reçu de : ",
                50,
                275,
                {
                    continued: true
                }
            )
            .font("Helvetica-Bold")
            .text(
                payment.tenant_name,
                {
                    continued: true
                }
            )
            .font("Helvetica")
            .text(
                " la somme de ",
                {
                    continued: true
                }
            )
            .font("Helvetica-Bold")
            .text(
                `${this.money(payment.amount)} FCFA`,
                {
                    continued: true
                }
            )
            .font("Helvetica")
            .text(
                " au titre du règlement du loyer correspondant à la période indiquée.",
                50,
                275,
                {
                    continued: true
                }
            );


        
        //====================================
        // SIGNATURE
        //====================================

        doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("black")
        .text(
            "Fait à Dakar, le " +
            new Date(payment.payment_date).toLocaleDateString("fr-FR"),
            170,
            300
        );

        doc
        .font("Helvetica-Bold")
        .text(
            "Signature",
            450,
            315
        );

        

        //====================================
        // PIED DE PAGE
        //====================================

        doc
            .moveTo(50, 380)
            .lineTo(545, 380)
            .strokeColor("#2563EB")
            .stroke();

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("gray")
            .text(
                "IBM MAREGA • Gestion Immobilière • Dakar - Sénégal",
                50,
                385,
                {
                    width: 495,
                    align: "center"
                }
            );

        doc.end();

        return `/receipts/${filename}`;

    }

    static formatDate(date) {

        return new Date(date).toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }

    static formatMonth(date) {

        return new Date(date).toLocaleDateString(
            "fr-FR",
            {
                month: "long",
                year: "numeric"
            }
        );

    }   

    static money(value) {

        return Number(value).toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).replace(/\u202f/g, " ");

    }
        

}

module.exports = ReceiptService;