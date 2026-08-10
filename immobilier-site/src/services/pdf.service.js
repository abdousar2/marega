const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const logo = path.join(
    __dirname,
    "../assets/logo-ibm-marega.png"
);

class PDFService {

    // =========================================================
    // OUTILS
    // =========================================================

    static money(value) {

        return Number(value || 0)
            .toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
            .replace(/\u202F/g, " ");

    }

    static date(value) {

        if (!value) return "";

        return new Date(value).toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }

    static text(value) {

        return value !== null &&
               value !== undefined
            ? String(value)
            : "";

    }

    // =========================================================
    // GENERATION DU CONTRAT
    // =========================================================

    static async generateLeasePDF(lease) {

        const folder = path.resolve(
            process.cwd(),
            "contracts"
        );

        if (!fs.existsSync(folder)) {

            fs.mkdirSync(folder, {
                recursive: true
            });

        }

        const filename =
            `${lease.contract_number}.pdf`;

        const filepath =
            path.join(folder, filename);

        const doc = new PDFDocument({

            size: "A4",

            margin: 0,

            bufferPages: true

        });

        const stream =
            fs.createWriteStream(filepath);

        doc.pipe(stream);

        // =====================================================
        // DONNEES
        // =====================================================

        const tenantName =
            this.text(lease.tenant_name)
            || "____________________________";

        const identityNumber =
            this.text(lease.identity_number)
            || "____________________________";

        
        const apartment =
            this.text(lease.apartment_number)
            || "________________";

        const level =
            this.text(lease.level)
            || "________________";

        const address =
            this.text(
                lease.property_address ||
                lease.address ||
                lease.building_address
            )
            || "____________________________";

        const monthlyRent =
            Number(
                lease.monthly_rent ||
                lease.rent ||
                0
            );

        const deposit =
            Number(
                lease.deposit ||
                monthlyRent
            );

        const startDate =
            this.date(lease.start_date);

        const endDate =
            this.date(lease.end_date);

        const tom =
            Number(
                lease.tom ||
                Math.round(monthlyRent * 0.036)
            );

        const rentBase =
            Number(
                lease.rent_base ||
                Math.max(monthlyRent - tom, 0)
            );

        const total =
            Number(
                lease.total_rent ||
                monthlyRent
            );

        // =====================================================
        // COULEURS
        // =====================================================

        const blue = "#164A70";
        const dark = "#111111";
        const gray = "#555555";

        // =====================================================
        // FONCTIONS GRAPHIQUES
        // =====================================================

        const line = (
            x1,
            y1,
            x2,
            y2,
            width = 0.7
        ) => {

            doc
                .moveTo(x1, y1)
                .lineTo(x2, y2)
                .lineWidth(width)
                .strokeColor(dark)
                .stroke();

        };

        const underlineTitle = (
            text,
            x,
            y,
            width = 500
        ) => {

            doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor(dark)
                .text(
                    text,
                    x,
                    y
                );

            line(
                x,
                y + 12,
                x + width,
                y + 12,
                0.8
            );

        };

        // =====================================================
        // PAGE 1
        // =====================================================

        // -----------------------------------------------------
        // EN-TETE
        // -----------------------------------------------------

        if (fs.existsSync(logo)) {

            doc.image(
                logo,
                45,
                30,
                {
                    width: 85
                }
            );

        }

        doc
            .font("Helvetica-Bold")
            .fontSize(15)
            .fillColor(blue)
            .text(
                "AGENCE IMMOBILIÈRE",
                150,
                32,
                {
                    width: 280,
                    align: "center"
                }
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(18)
            .fillColor(dark)
            .text(
                "IBM MAREGA",
                150,
                51,
                {
                    width: 280,
                    align: "center"
                }
            );

        doc
            .font("Helvetica")
            .fontSize(7)
            .fillColor(gray)
            .text(
                "Gérance. Achat. Vente. Promotion Immobilière.",
                150,
                73,
                {
                    width: 280,
                    align: "center"
                }
            );

        doc
            .font("Helvetica")
            .fontSize(7)
            .text(
                "Bâtiment-Travaux Publics. Toutes Transactions Immobilières",
                150,
                84,
                {
                    width: 280,
                    align: "center"
                }
            );

        // Bloc NINEA
        doc
            .rect(445, 35, 115, 50)
            .lineWidth(1)
            .strokeColor(blue)
            .stroke();

        doc
            .font("Helvetica-Bold")
            .fontSize(8)
            .fillColor(blue)
            .text(
                "AGENCE IMMOBILIÈRE",
                450,
                42,
                {
                    width: 105,
                    align: "center"
                }
            );

        doc
            .fontSize(10)
            .text(
                "IBM MAREGA",
                450,
                53,
                {
                    width: 105,
                    align: "center"
                }
            );

        doc
            .fontSize(7)
            .text(
                "NINEA 004032570",
                450,
                68,
                {
                    width: 105,
                    align: "center"
                }
            );

        // -----------------------------------------------------
        // TITRE
        // -----------------------------------------------------

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(
                "CONTRAT DE LOCATION",
                0,
                120,
                {
                    align: "center"
                }
            );

        // -----------------------------------------------------
        // ENTRE LES SOUSSIGNES
        // -----------------------------------------------------

        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(
                "ENTRE LES SOUSSIGNÉS :",
                60,
                145
            );

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                "MAMADOU MAREGA, représenté par",
                60,
                162,
                {
                    continued: true
                }
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .text(
                " L'AGENCE IMMOBILIERE IBM MAREGA SARL ",
                60,
                162,
                
            );     
            
        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                "D'une part, et ",
                60,
                179,
                
            );  

        doc
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .text(
                tenantName.toUpperCase(),
                60,
                197,
                {
                    continued: true
                }
            );

        doc
            .font("Helvetica-Bold")
            .text(
                " titulaire de la carte d'identité ",
                {
                    continued: true
                }
            );

        doc
            .font("Helvetica-Bold")
            .text(
                identityNumber,
               
            );

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                "locataire, preneur D'autre part; il a été convenu et arrêté ce qui suit : ",
                60,
                215,
                {
                    width: 480,
                    align: "justify"
                }
            );

        // -----------------------------------------------------
        // ARTICLE / OBJET DU CONTRAT
        // -----------------------------------------------------

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                `Le bailleur loue à ${tenantName.toUpperCase()} preneur qui accepte ` +
                `UN APPARTEMENT ${level.toUpperCase()} PORTE N° ${apartment} ` +
                `${address.toUpperCase()}. Le preneur reconnaissant parfaitement les lieux pour les avoir visités, ` +
                `le bail est fait pour une durée d'un an renouvelable par tacite reconduction ` +
                `qui commence à courir le ${startDate}.`,
                60,
                240,
                {
                    width: 480,
                    align: "justify"
                }
            );
        // -----------------------------------------------------
        // LOYER
        // -----------------------------------------------------

        doc
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .text(
                "LOYER : ",
                60,
                290,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );

        
        doc
            .font("Helvetica")
            .text(
                `En outre, le présent bail est consenti moyennant un loyer mensuel de ` +
                `${this.money(total)} FCFA (${this.amountInWords(total)}) payable d'avance, au plus tard le 5ème jour du mois en cours,` +
                ` étant d'ores et déjà convenu que le loyer est strictement conforme aux textes officiels en la matière` +
                ` et qu'un décompte légal a été étbli et signé par les deux parties. `,
                60,
                290,
                {
                    continued: true,
                    
                }
            );

        doc
            .font("Helvetica-Bold")            
            .text(
                " Il a été clairement entendu que le loyer est portable et non quérable. ",
                               
                
            );

        // -----------------------------------------------------
        // TABLEAU LOYER
        // -----------------------------------------------------

        const tableX = 165;
        const tableY = 345;

        doc
            .font("Helvetica")
            .fontSize(8);

        doc.text(
            "Montant loyer de BASE",
            tableX,
            tableY
        );

        doc
            .font("Helvetica-Bold")
            .text(
                `${this.money(rentBase)} FCFA`,
                350,
                tableY
            );

        doc
            .font("Helvetica")
            .text(
                "TOM 3.6%",
                tableX,
                tableY + 20
            );

        doc
            .font("Helvetica-Bold")
            .text(
                `${this.money(tom)} FCFA`,
                350,
                tableY + 20
            );

        doc
            .font("Helvetica")
            .text(
                "TLV (Enregistrement)",
                tableX,
                tableY + 40
            );

        doc
            .font("Helvetica-Bold")
            .text(
                `${this.money(lease.registration || 0)} FCFA`,
                350,
                tableY + 40
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(
                "TOTAL",
                tableX,
                tableY + 70
            );

        doc
            .text(
                `${this.money(total)} FCFA`,
                350,
                tableY + 70
            );

        // -----------------------------------------------------
        // CHARGES ET CONDITIONS
        // -----------------------------------------------------

        underlineTitle(
            "CHARGES ET CONDITIONS :",
            60,
            440,
            136
        );

        doc
            .font("Helvetica-Bold")
            .fontSize(8.2);

       doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 1 - ",
                60,
                462,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica")
            .text(
                "Le preneur s'engage à tenir constamment garnis les lieux loués de meubles en quantité suffisante pour garantir le bailleur du paiement des loyers et de l'exécution des conditions du bail.",
                60,
                462,
                
            );

        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 2 - ",
                60,
                496,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica")
            .text(
                "Le preneur ne pourra faire aucun aménagement, modification ou transformation dans l'état ou la disposition des locaux, sans l'autorisation préalable, expresse ou écrite du bailleur. Tous aménagements, embellissements, améliorations, appartiendront de plein droit au bailleur en fin de bail, sans que le preneur ne puisse prétendre à aucune indemnité.",
                60,
                496,
                
            );

        
        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 3 - ",
                60,
                540,
                {
                    continued: true
                }
            );

        doc
            .font("Helvetica")
            .text(
                "Le preneur acquittera exactement ses consommations d'électricité et d'eau.",
                {
                    width: 480
                }
            );

        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 4 - ",
                60,
                570,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica")
            .text(
                "Le jour de l'expiration du bail, le preneur devra remettre au bailleur les clés des locaux et lui " +
                "produire le QUITUS et le bon de coupure de la SENELEC, SONATEL, (ou SDE si besoin était).",
                {
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 5 - ",
                60,
                600,
                {
                    continued: true
                }
            );

        doc
            .font("Helvetica")
            .text(
                "Le preneur ne pourra en aucun cas sous louer ou céder tout ou partie du bien loué.",
                {
                    width: 480
                }
            );

        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 6 - ",
                60,
                640,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica")
            .text(
                `A titre de provision, et pour la bonne garantie d'exécution des clauses du présent contrat, ` +
                `le preneur sera tenu de verser au bailleur une caution, contre récépissé au moment de la signature, ` +
                `la somme de : ${this.money(deposit)} FCFA représentant la caution entre les mains DE L'AGENCE. ` +
                `Cette somme sera restituée lors de la remise des clés des locaux, déduction faite de toutes sommes ` +
                `qui pourraient être dues par le preneur, tant pour réparations que pour toute autre cause. ` +
                `Il est clairement entendu que la caution ne pourra servir au règlement des loyers durant la période ` +
                `de préavis du preneur, qu'avec l'accord formel du bailleur.`,
                {
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 7 - LA PRESENCE D'ANIMAUX DOMESTIQUES",
                60,
                700,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );
        
        doc
            .font("Helvetica-Bold")
            .text(
                "(moutons, chiens, élevage pigeons, lapins, poulets et autres) NE SONT PAS AUTORISES DANS LES APPARTEMENTS ET DANS LES MAISONS.",
                
                {
                    width: 480
                }
            );

        // -----------------------------------------------------
        // ARTICLE 8
        // -----------------------------------------------------

        doc
            .font("Helvetica-Bold")
            .text(
                "ARTICLE 8 - ",
                60,
                730,
                {
                    continued: true,
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .font("Helvetica")
            .text(
                "LES APPARTEMENTS LOUES A USAGE D'HABITATION NE PEUVENT ETRE UTILISES EN APPARTEMENTS " +
                "MEUBLES. TOUT CONSTAT D'UTILISATION EN APPARTEMENTS MEUBLES ENTRAINE LA RESILIATION DU CONTRAT " +
                "SANS DELAIS ET SANS CONDITIONS.",
                {
                    width: 480,
                    align: "justify"
                }
            );
        

        // =====================================================
        // PAGE 2
        // =====================================================

        doc.addPage();

        

        // -----------------------------------------------------
        // CLAUSES RESOLUTOIRES
        // -----------------------------------------------------

        underlineTitle(
            "CLAUSES RESOLUTOIRES :",
            60,
            70,
            134
        );

        doc
            .font("Helvetica")
            .fontSize(8.3)
            .text(
                "A défaut du paiement d'un seul terme de loyer à son échéance ou de l'inexécution d'une quelconque " +
                "des clauses et conditions du bail, celui-ci sera résilié de plein droit si bon semble au bailleur et " +
                "sans formalité judiciaire, (08) huit jours après simple mise à demeure restée sans effet, quelque soit " +
                "la cause de cette carence et nonobstant toutes consignations ultérieures. L'expulsion sera prononcée " +
                "par simple ordonnance de référé. Il est également clairement entendu et d'ores et déjà accepté par " +
                "le preneur que tout changement de la destination initiale du bien loué, qu'il soit à usage d'habitation " +
                "ou commerciale ainsi que de bureau, sans l'autorisation du bailleur, entraînera l'annulation pure et " +
                "simple du présent bail.",
                60,
                90,
                {
                    width: 480,
                    align: "justify"
                }
            );

        // -----------------------------------------------------
        // ELECTION DE DOMICILE
        // -----------------------------------------------------

        underlineTitle(
            "ELECTION DE DOMICILE :",
            60,
            165,
            125
        );

        doc
            .font("Helvetica")
            .fontSize(8.3)
            .text(
                "Pour l'exécution des présentes et de leurs suites, les parties font élection de domicile à Dakar, " +
                "les bailleurs représentés par l'AGENCE IMMOBILIERE IBM MAREGA SARL au 80 rue Alfred Goux x " +
                "Avenue Lamine Gueye. Le preneur dans les lieux loués.",
                60,
                185,
                {
                    width: 480,
                    align: "justify"
                }
            );

        doc
            .text(
                "Enregistrement : Les frais de timbres et enregistrement sont à la charge exclusive du preneur.",
                60,
                215,
                {
                    width: 480
                }
            );

        // -----------------------------------------------------
        // PREAVIS
        // -----------------------------------------------------

        underlineTitle(
            "PREAVIS :",
            60,
            240,
            49
        );

        doc
            .font("Helvetica")
            .fontSize(8.3)
            .text(
                "Application du code des obligations civiles et commerciales (02 mois pour le preneur).",
                60,
                260
            );

        // -----------------------------------------------------
        // SIGNATURES
        // -----------------------------------------------------

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(
                "LE BAILLEUR",
                70,
                700
            );

        doc
            .text(
                "LE PRENEUR",
                455,
                700
            );

        // Ligne signature bailleur
        line(
            70,
            710,
            140,
            710,
            0.8
        );

        // Ligne signature preneur
        line(
            453,
            710,
            520,
            710,
            0.8
        );       
        

        // =====================================================
        // FINALISATION
        // =====================================================

        doc.end();

        await new Promise(
            (resolve, reject) => {

                stream.on(
                    "finish",
                    resolve
                );

                stream.on(
                    "error",
                    reject
                );

            }
        );

        console.log(
            "PDF enregistré :",
            filepath
        );

        return `/contracts/${filename}`;

    }

    // =========================================================
    // NOMBRE EN LETTRES
    // =========================================================

    static amountInWords(amount) {

        const units = [
            "",
            "un",
            "deux",
            "trois",
            "quatre",
            "cinq",
            "six",
            "sept",
            "huit",
            "neuf",
            "dix",
            "onze",
            "douze",
            "treize",
            "quatorze",
            "quinze",
            "seize"
        ];

        if (amount < 17) {

            return units[amount] || "";

        }

        if (amount < 20) {

            return "dix-" + units[amount - 10];

        }

        if (amount < 100) {

            const tens = [
                "",
                "",
                "vingt",
                "trente",
                "quarante",
                "cinquante",
                "soixante",
                "soixante-dix",
                "quatre-vingt",
                "quatre-vingt-dix"
            ];

            const t = Math.floor(amount / 10);
            const u = amount % 10;

            if (u === 0) return tens[t];

            return `${tens[t]}-${units[u]}`;

        }

        if (amount < 1000) {

            const h = Math.floor(amount / 100);
            const rest = amount % 100;

            let result =
                h === 1
                    ? "cent"
                    : `${units[h]} cent`;

            if (rest) {

                result += ` ${this.amountInWords(rest)}`;

            }

            return result;

        }

        if (amount < 1000000) {

            const thousands =
                Math.floor(amount / 1000);

            const rest =
                amount % 1000;

            let result =
                thousands === 1
                    ? "mille"
                    : `${this.amountInWords(thousands)} mille`;

            if (rest) {

                result +=
                    ` ${this.amountInWords(rest)}`;

            }

            return result;

        }

        return this.money(amount);

    }

}

module.exports = PDFService;