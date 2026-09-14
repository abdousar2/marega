const DocumentAIService =
    require("../services/document-ai.service");

const DocumentTemplateService =
    require("../services/document-template.service");

const Agency =
    require("../models/agency.model");

const TemplateRendererService =
    require("../services/template-renderer.service");

const TemplatePDFService =
    require("../services/template-pdf.service");


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

            console.log("===== ANALYSIS AVANT INSERT =====");

console.log(
    JSON.stringify(
        analysis,
        null,
        2
    )
);

console.log("===== LAYOUT AVANT INSERT =====");

console.log(
    JSON.stringify(
        analysis?.layout,
        null,
        2
    )
);

console.log("===============================");
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
                await Agency.getById(agencyId);

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

            console.log(
                "===== LAYOUT DÉTECTÉ ====="
            );

            console.log(
                JSON.stringify(
                    analysisResult.analysis?.layout,
                    null,
                    2
                )
            );

            console.log(
                "=========================="
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

    // =========================================================
    // RENDRE LE TEMPLATE EN PDF
    // =========================================================

    static async renderLeasePDF(req, res) {

        try {

            const {
                templateId,
                leaseId
            } = req.body;


            let agencyId;

            if (
                req.user &&
                req.user.role === "PLATFORM_ADMIN"
            ) {

                agencyId =
                    Number(
                        req.body.agency_id
                    );

            } else {

                agencyId =
                    Number(
                        req.user.agency_id
                    );
            }


            if (!templateId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "templateId est obligatoire."
                });
            }


            if (!leaseId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "leaseId est obligatoire."
                });
            }


            if (!agencyId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "agency_id est obligatoire."
                });
            }


            // =====================================================
            // 1. RENDRE LE TEMPLATE
            // =====================================================

            const rendered =
                await TemplateRendererService.renderByLease({
                    templateId:
                        Number(templateId),

                    leaseId:
                        Number(leaseId),

                    agencyId
                });


            // =====================================================
            // 2. VÉRIFIER
            // =====================================================

            if (!rendered.ready) {

                return res.status(422).json({
                    success: false,
                    message:
                        "Le document contient des variables obligatoires manquantes.",

                    missing_variables:
                        rendered.missing_variables
                });
            }


            // =====================================================
            // 3. GÉNÉRER LE PDF
            // =====================================================

            const pdf =
                await TemplatePDFService
                    .generateFromRenderedResult(
                        rendered
                    );


            // =====================================================
            // 4. RÉPONSE
            // =====================================================

            return res.status(200).json({

                success: true,

                message:
                    "Contrat PDF généré avec succès.",

                pdf,

                rendered
            });

        }
        catch (error) {

            console.error(
                "Erreur génération PDF template:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la génération du PDF.",

                error:
                    error.message
            });
        }
    }

}


module.exports =
    DocumentTemplateController;