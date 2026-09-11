const DocumentAIService =
    require("../services/document-ai.service");

const DocumentTemplateService =
    require("../services/document-template.service");

const Agency =
    require("../models/agency.model");


class DocumentTemplateController {


    // =========================================================
    // ANALYSER
    // =========================================================

    static async analyze(req, res) {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Aucun document fourni."
                });

            }

            const result =
                await DocumentAIService.analyze(
                    req.file.path
                );


            return res.json({

                success: true,

                filename:
                    req.file.originalname,

                result

            });

        } catch (error) {

            console.error(
                "Erreur analyse document:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Erreur lors de l'analyse du document.",

                error:
                    error.message

            });

        }

    }
    
    // =========================================================
    // ENREGISTRER LE TEMPLATE
    // =========================================================

    static async save(req, res) {

        try {

            // =====================================================
            // 1. DÉTERMINER L'AGENCE
            // =====================================================

            let agencyId;

            // -----------------------------------------------------
            // Cas PLATFORM_ADMIN
            // -----------------------------------------------------

            if (req.user.role === "PLATFORM_ADMIN") {

                agencyId = req.body.agency_id;

            }

            // -----------------------------------------------------
            // Cas ADMIN / RESPONSABLE / etc.
            // -----------------------------------------------------

            else {

                agencyId = req.user.agency_id;

            }


            // =====================================================
            // 2. VÉRIFICATION AGENCE
            // =====================================================

            if (!agencyId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "L'agence cible est obligatoire."

                });

            }


            agencyId = Number(agencyId);


            if (!Number.isInteger(agencyId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "L'identifiant de l'agence est invalide."

                });

            }


            // =====================================================
            // 3. RÉCUPÉRER LES DONNÉES
            // =====================================================

            const {
                name,
                source_document_path,
                analysis
            } = req.body;


            // =====================================================
            // 4. VÉRIFIER L'ANALYSE
            // =====================================================

            if (!analysis) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Analyse du document manquante."

                });

            }


            // =====================================================
            // 5. PARSER L'ANALYSE
            // =====================================================

            const parsedAnalysis =
                typeof analysis === "string"
                    ? JSON.parse(analysis)
                    : analysis;


            // =====================================================
            // 6. VÉRIFICATION STRUCTURE ANALYSE
            // =====================================================

            if (!parsedAnalysis.document_type) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Le type de document est manquant."

                });

            }


            // =====================================================
            // 7. ENREGISTREMENT
            // =====================================================

            const result =
                await DocumentTemplateService.createFromAnalysis({

                    agencyId,

                    name:
                        name ||
                        "Template généré automatiquement",

                    sourceDocumentPath:
                        source_document_path ||
                        null,

                    analysis:
                        parsedAnalysis

                });


            // =====================================================
            // 8. RÉPONSE
            // =====================================================

            return res.status(201).json({

                success: true,

                message:
                    "Template enregistré avec succès.",

                result

            });

        }

        catch (error) {

            console.error(
                "Erreur enregistrement template:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Erreur lors de l'enregistrement du template.",

                error:
                    error.message

            });

        }

    }

    // =========================================================
    // ANALYSER + ENREGISTRER AUTOMATIQUEMENT
    // =========================================================

    static async process(req, res) {

        try {

            // -------------------------------------------------
            // Vérification du fichier
            // -------------------------------------------------

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Aucun document fourni."
                });

            }

            // -------------------------------------------------
            // Agence cible fournie par PLATFORM_ADMIN
            // -------------------------------------------------

            const agencyId =
                Number(req.body.agency_id);


            if (!agencyId || !Number.isInteger(agencyId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "agency_id est obligatoire et doit être un entier."

                });

            }

            const agency =
                await Agency.findById(agencyId);

            if (!agency) {

                return res.status(404).json({

                    success: false,

                    message:
                        "L'agence cible est introuvable."

                });

            }

            // -------------------------------------------------
            // Nom du template
            // -------------------------------------------------

            const name =
                req.body.name ||
                `Template - ${req.file.originalname}`;


            // -------------------------------------------------
            // 1. ANALYSE DU DOCUMENT
            // -------------------------------------------------

            console.log(
                "Analyse automatique :",
                req.file.originalname
            );


            const analysisResult =
                await DocumentAIService.analyze(
                    req.file.path
                );


            // -------------------------------------------------
            // 2. Vérifier le résultat
            // -------------------------------------------------

            if (
                !analysisResult ||
                !analysisResult.analysis
            ) {

                return res.status(422).json({

                    success: false,

                    message:
                        "Le document n'a pas pu être analysé.",

                    result:
                        analysisResult

                });

            }


            // -------------------------------------------------
            // 3. Enregistrer dans PostgreSQL
            // -------------------------------------------------

            const result =
                await DocumentTemplateService
                    .createFromAnalysis({

                        agencyId,

                        name,

                        sourceDocumentPath:
                            req.file.path,

                        analysis:
                            analysisResult.analysis

                    });


            // -------------------------------------------------
            // 4. Réponse
            // -------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Document analysé et template enregistré avec succès.",

                filename:
                    req.file.originalname,

                analysis:
                    analysisResult,

                saved:
                    result

            });

        }

        catch (error) {

            console.error(
                "Erreur traitement automatique du document :",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Erreur lors du traitement automatique du document.",

                error:
                    error.message

            });

        }

    }

}


module.exports =
    DocumentTemplateController;