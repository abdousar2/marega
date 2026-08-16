const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { toUSVString } = require("util");


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

        doc.roundedRect(50, 210, 470, 50, 12)
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

        
        doc.roundedRect(50, 268, 350, 110, 8)
            .fillAndStroke("#EFF6FF", "#2563EB");


        doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "1 -  ",
                
                55,
                273,
                {
                                        
                    width: 320,
                    align: "justify"               
                }

            );

            doc
            .font("Helvetica")            
            .text(
                " Le locataire ne pourra pour quelles que raisons que ce soient céder ou" +
                "sous louer en totalité ou en partie, les locaux loués sans le consentement écris du bailleur.",
                65,
                273,

                {
                                        
                    width: 320,
                    align: "justify"               
                }                              
                
            );

            doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "2 -  ",
                
                55,
                293,
                {
                                        
                    width: 320,
                    align: "justify"               
                }

            );

            doc
            .font("Helvetica")            
            .text(
                " Le locataire ne peut pas déménager, sans : ",

                65,
                293,

                {
                                        
                    width: 320,
                    align: "justify"               
                }                              
                
            );

            doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "a)-  ",
                
                65,
                303,
                {
                                        
                    width: 320,
                    align: "justify"               
                }

            );

            doc
            .font("Helvetica")            
            .text(
                " qu'il n'ait justifié au bailleur par une quittance " +
                "du percepteur qu'il a acquitté toutes ses contributions de l'année courante",
                75,
                303,

                {
                                        
                    width: 320,
                    align: "justify"               
                }                               
                
            );

            doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "b)-  ",
                
                65,
                323,
                {
                                        
                    width: 320,
                    align: "justify"               
                }

            );

            doc
            .font("Helvetica")            
            .text(
                " qu'il n'ait donné ou reçu congé par acte extra judiciaire suivant la législation" +
                "en vigueur et dans les delais prescrits par la loi",
                75,
                323,
                {
                                        
                    width: 320,
                    align: "justify"               
                }                              
                
            );

            doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "c)-  ",
                
                65,
                343,
                {
                                        
                    width: 320,
                    align: "justify"               
                }

            );

            doc
            .font("Helvetica")            
            .text(
                " qu'il n'ait fait faire à ses frais, toutes les réparations locatives et la réfectiontotale" +
                "des lieux, dans touS les corps de métier, suivant usage ou d'après l'état des lieux s'il en existe un," +
                "seuls restant à la charge du bailleur les clos et le couvert.",

                75,
                343,
                {
                                        
                    width: 320,
                    align: "justify"               
                }                               
                
            );

            doc
            .fillColor("black")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "3 - ",
                
                55,
                370,
                {
                                        
                    width: 320,
                    align: "justify"               
                }

            );

            doc
            .font("Helvetica")            
            .text(
                " Le paiement de la présente n'implique pas présomption du paiement des quittances antérieures. ",

                65,
                370,
                {
                                        
                    width: 320,
                    align: "justify"               
                }                              
                
            );           
            

        
        //====================================
        // SIGNATURE
        //====================================

        doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("black")
        .text(
            "Fait à Dakar, le " +
            new Date(payment.payment_date).toLocaleDateString("fr-FR"),
            405,
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