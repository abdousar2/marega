const AuditLog = require("../models/audit.model");


class AuditController {

    // =========================================================
    // JOURNAL D'AUDIT
    // =========================================================

    static async getAll(req, res) {

        try {

            const limit =
                Math.min(
                    Number(req.query.limit) || 100,
                    500
                );

            const offset =
                Math.max(
                    Number(req.query.offset) || 0,
                    0
                );


            const logs =
                await AuditLog.getAll({
                    limit,
                    offset
                });


            res.json(logs);

        }

        catch (err) {

            console.error(
                "Erreur chargement audit :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors du chargement du journal d'audit."

            });

        }

    }

}


module.exports = AuditController;