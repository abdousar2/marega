const Agency = require("../models/agency.model");
const fs = require("fs");
const path = require("path");


class AgencyController {


    // =========================================================
    // TOUTES LES AGENCES
    // =========================================================

    static async getAll(req, res) {

        try {

            const agencies =
                await Agency.getAll();

            res.json(agencies);

        }

        catch (err) {

            console.error(
                "Erreur chargement agences :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors du chargement des agences."

            });

        }

    }


    // =========================================================
    // AGENCE PAR ID
    // =========================================================

    static async getById(req, res) {

        try {

            const agency =
                await Agency.getById(
                    Number(req.params.id)
                );


            if (!agency) {

                return res.status(404).json({

                    error:
                        "Agence introuvable."

                });

            }


            res.json(agency);

        }

        catch (err) {

            console.error(
                "Erreur chargement agence :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors du chargement de l'agence."

            });

        }

    }


    // =========================================================
    // UPLOAD DES DOCUMENTS
    // =========================================================

    static async uploadDocuments(req, res) {

        try {

            // -------------------------------------------------
            // AGENCE DE L'UTILISATEUR CONNECTÉ
            // -------------------------------------------------

            const agencyId =
                req.user.agency_id;


            // -------------------------------------------------
            // VÉRIFIER L'AGENCE
            // -------------------------------------------------

            const agency =
                await Agency.getById(
                    agencyId
                );


            if (!agency) {

                return res.status(404).json({

                    error:
                        "Agence introuvable."

                });

            }


            // -------------------------------------------------
            // DOSSIER DE L'AGENCE
            // -------------------------------------------------

            const agencyFolder =
                path.resolve(

                    process.cwd(),

                    "uploads",

                    "agencies",

                    String(agencyId)

                );


            if (!fs.existsSync(agencyFolder)) {

                fs.mkdirSync(

                    agencyFolder,

                    {
                        recursive: true
                    }

                );

            }


            const documents = {

                logo_path: null,

                contract_template_path: null,

                receipt_template_path: null

            };


            const files =
                req.files || {};

            const moveFile = (
                source,
                destination
            ) => {

                // Supprimer l'ancien fichier s'il existe
                if (fs.existsSync(destination)) {

                    fs.unlinkSync(destination);

                }

                // Déplacer le nouveau fichier
                fs.renameSync(
                    source,
                    destination
                );

            };

            // =================================================
            // LOGO
            // =================================================

            if (
                files.logo &&
                files.logo[0]
            ) {

                const file =
                    files.logo[0];

                const extension =
                    path.extname(
                        file.originalname
                    ).toLowerCase();

                const destination =
                    path.join(
                        agencyFolder,
                        `logo${extension}`
                    );

                moveFile(
                    file.path,
                    destination
                );

                documents.logo_path =
                    `/uploads/agencies/${agencyId}/logo${extension}`;

            }

            // =================================================
            // CONTRAT
            // =================================================

            if (
                files.contract &&
                files.contract[0]
            ) {

                const file =
                    files.contract[0];

                const destination =
                    path.join(
                        agencyFolder,
                        "contract.pdf"
                    );

                moveFile(
                    file.path,
                    destination
                );

                documents.contract_template_path =
                    `/uploads/agencies/${agencyId}/contract.pdf`;

            }

            // =================================================
            // REÇU
            // =================================================

            if (
                files.receipt &&
                files.receipt[0]
            ) {

                const file =
                    files.receipt[0];

                const destination =
                    path.join(
                        agencyFolder,
                        "receipt.pdf"
                    );

                moveFile(
                    file.path,
                    destination
                );

                documents.receipt_template_path =
                    `/uploads/agencies/${agencyId}/receipt.pdf`;

            }

            // =================================================
            // AUCUN DOCUMENT
            // =================================================

            if (

                !documents.logo_path &&

                !documents.contract_template_path &&

                !documents.receipt_template_path

            ) {

                return res.status(400).json({

                    error:
                        "Aucun document fourni."

                });

            }


            // =================================================
            // ENREGISTRER LES CHEMINS EN BASE
            // =================================================

            const updatedAgency =
                await Agency.updateDocuments(

                    agencyId,

                    documents

                );


            res.json({

                message:
                    "Documents de l'agence enregistrés avec succès.",

                agency:
                    updatedAgency

            });

        }

        catch (err) {

            console.error(

                "Erreur upload documents agence :",

                err

            );


            res.status(500).json({

                error:
                    "Erreur lors de l'enregistrement des documents."

            });

        }

    }

}


module.exports = AgencyController;