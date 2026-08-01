const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReceiptService {

    static async generateReceipt(payment) {

        const folder = path.join(__dirname, "../../receipts");

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        const filename = `RECU-${payment.id}.pdf`;

        const filepath = path.join(folder, filename);

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        doc.pipe(fs.createWriteStream(filepath));

        doc.fontSize(24)
            .text("MAREGA", {
                align: "center"
            });

        doc.moveDown();

        doc.fontSize(18)
            .text("QUITTANCE DE LOYER", {
                align: "center"
            });

        doc.moveDown(2);

        doc.fontSize(12);

        doc.text(`Référence : RECU-${payment.id}`);

        doc.text(`Locataire : ${payment.tenant_name}`);

        doc.text(`Appartement : ${payment.apartment_number}`);

        doc.text(`Immeuble : ${payment.building_name}`);

        doc.moveDown();

        doc.text(`Mois concerné : ${payment.payment_month}`);

        doc.text(`Montant payé : ${payment.amount} FCFA`);

        doc.text(`Date de paiement : ${payment.payment_date}`);

        doc.text(`Mode de paiement : ${payment.payment_method}`);

        doc.moveDown(2);

        doc.text(
            "Le présent document atteste que le loyer ci-dessus a été intégralement réglé.",
            {
                align: "justify"
            }
        );

        doc.moveDown(4);

        doc.text("Signature MAREGA", {
            align: "right"
        });

        doc.end();

        return `/receipts/${filename}`;

    }

}

module.exports = ReceiptService;