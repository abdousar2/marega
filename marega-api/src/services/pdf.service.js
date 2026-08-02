const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class PDFService {

    static async generateLeasePDF(lease) {        
        
       const folder = path.resolve(process.cwd(), "contracts");

        console.log("process.cwd() =", process.cwd());
        console.log("__dirname =", __dirname);
        console.log("folder =", folder);

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        console.log("Dossier PDF :", folder);

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        const filename = `${lease.contract_number}.pdf`;

        const filepath = path.join(folder, filename);

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const stream = fs.createWriteStream(filepath);

        doc.fontSize(22)
   .text("MAREGA VERSION 2", {
       align: "center"
   });

        doc.pipe(stream);

        doc.fontSize(22)
            .text("MAREGA", { align: "center" });

        doc.moveDown();

        doc.fontSize(18)
            .text("CONTRAT DE LOCATION", { align: "center" });

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

        await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
        });

        console.log(
            fs.readdirSync(folder)
        );

        console.log("PDF enregistré :", filepath);

        return `/contracts/${filename}`;

    }

}

module.exports = PDFService;