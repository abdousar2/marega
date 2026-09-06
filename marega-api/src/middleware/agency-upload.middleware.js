const multer = require("multer");
const path = require("path");
const fs = require("fs");


// =========================================================
// DOSSIER TEMPORAIRE
// =========================================================

const uploadDir = path.resolve(
    process.cwd(),
    "uploads",
    "agencies",
    "tmp"
);


if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {
        recursive: true
    });

}


// =========================================================
// STOCKAGE TEMPORAIRE
// =========================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDir);

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname)
            .toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}${extension}`;

        cb(null, uniqueName);

    }

});


// =========================================================
// TYPES AUTORISÉS
// =========================================================

const allowedMimeTypes = {

    logo: [
        "image/png",
        "image/jpeg",
        "image/webp"
    ],

    contract: [
        "application/pdf"
    ],

    receipt: [
        "application/pdf"
    ]

};


// =========================================================
// VALIDATION
// =========================================================

const fileFilter = (req, file, cb) => {

    const allowed =
        allowedMimeTypes[file.fieldname];


    if (!allowed) {

        return cb(
            new Error(
                "Type de document non autorisé."
            )
        );

    }


    if (!allowed.includes(file.mimetype)) {

        return cb(
            new Error(
                `Type de fichier non autorisé pour ${file.fieldname}.`
            )
        );

    }


    cb(null, true);

};


// =========================================================
// MULTER
// =========================================================

const uploadAgencyDocuments =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize: 10 * 1024 * 1024

        }

    });


module.exports =
    uploadAgencyDocuments;