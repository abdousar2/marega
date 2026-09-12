const TemplateRendererService =
    require("../services/template-renderer.service");


class TemplateRendererController {

    // =========================================================
    // RENDRE UN TEMPLATE POUR UN BAIL
    // =========================================================

    static async renderLease(req, res) {

        try {

            const {
                templateId,
                leaseId,
                agency_id
            } = req.body;


            // =====================================================
            // 1. VALIDATION TEMPLATE
            // =====================================================

            if (!templateId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "templateId est obligatoire."

                });

            }


            // =====================================================
            // 2. VALIDATION BAIL
            // =====================================================

            if (!leaseId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "leaseId est obligatoire."

                });

            }


            // =====================================================
            // 3. DÉTERMINER L'AGENCE
            // =====================================================

            let agencyId;


            // -----------------------------------------------------
            // PLATFORM_ADMIN
            // -----------------------------------------------------

            if (
                req.user.role === "PLATFORM_ADMIN"
            ) {

                agencyId =
                    Number(agency_id);

            }


            // -----------------------------------------------------
            // UTILISATEUR D'UNE AGENCE
            // -----------------------------------------------------

            else {

                agencyId =
                    Number(
                        req.user.agency_id
                    );

            }


            // =====================================================
            // 4. VÉRIFIER L'AGENCE
            // =====================================================

            if (
                !agencyId ||
                !Number.isInteger(agencyId)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "agency_id est obligatoire et doit être un entier."

                });

            }


            // =====================================================
            // 5. RENDU
            // =====================================================

            const result =
                await TemplateRendererService.renderByLease({

                    templateId:
                        Number(templateId),

                    leaseId:
                        Number(leaseId),

                    agencyId

                });


            // =====================================================
            // 6. RÉPONSE
            // =====================================================

            return res.status(200).json({

                success: true,

                message:
                    "Template rendu avec succès.",

                result

            });


        } catch (error) {

            console.error(
                "Erreur rendu template :",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Erreur lors du rendu du template.",

                error:
                    error.message

            });

        }

    }

}


module.exports =
    TemplateRendererController;