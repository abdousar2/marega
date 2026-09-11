const multer = require("multer");
const path = require("path");
const fs = require("fs");


// =========================================================
// DOSSIER TEMPORAIRE
// =========================================================

const uploadDirectory =
    path.resolve(
        process.cwd(),
        "uploads",
        "document-analysis"
    );


if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// =========================================================
// STOCKAGE
// =========================================================

const storage =
    multer.diskStorage({

        destination:
            (req, file, cb) => {

                cb(
                    null,
                    uploadDirectory
                );

            },

        filename:
            (req, file, cb) => {

                const extension =
                    path.extname(
                        file.originalname
                    );

                const filename =
                    `document-${Date.now()}${extension}`;

                cb(
                    null,
                    filename
                );

            }

    });


// =========================================================
// FILTRE
// =========================================================

const fileFilter =
    (req, file, cb) => {

        if (
            file.mimetype ===
            "application/pdf"
        ) {

            cb(
                null,
                true
            );

            return;

        }


        cb(
            new Error(
                "Seuls les fichiers PDF sont autorisés."
            )
        );

    };


// =========================================================
// MULTER
// =========================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                10 * 1024 * 1024

        }

    });


module.exports =
    upload;