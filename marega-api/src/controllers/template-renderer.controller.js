const TemplateRendererService =
    require("../services/template-renderer.service");

class TemplateRendererController {

    static async renderLease(
        req,
        res
    ) {

        try {

            const {
                templateId,
                leaseId
            } = req.body;

            const agencyId =
                req.user.agency_id;

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


            const result =
                await TemplateRendererService.renderByLease({

                    templateId:
                        Number(templateId),

                    leaseId:
                        Number(leaseId),

                    agencyId:
                        Number(agencyId)

                });


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