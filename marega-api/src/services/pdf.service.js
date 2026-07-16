const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class PDFService {

    static async generateLeasePDF(lease) {

        const folder = path.join(__dirname, "../../contracts");

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        const filename = `${lease.contract_number}.pdf`;

        const filepath = path.join(folder, filename);

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        doc.pipe(fs.createWriteStream(filepath));

        doc.fontSize(22)
            .text("MAREGA", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(18)
            .text("CONTRAT DE LOCATION", {
                align: "center"
            });

        doc.moveDown(2);

        doc.fontSize(12);

        doc.text(`Numéro : ${lease.contract_number}`);
        doc.text(`Locataire : ${lease.tenant_name}`);
        doc.text(`Appartement : ${lease.apartment_number}`);
        doc.text(`Date début : ${lease.start_date}`);
        doc.text(`Date fin : ${lease.end_date}`);

        doc.moveDown();

        doc.text(`Loyer : ${lease.monthly_rent} FCFA`);
        doc.text(`Caution : ${lease.deposit} FCFA`);

        doc.end();

        return `/contracts/${filename}`;

    }

}

module.exports = PDFService;