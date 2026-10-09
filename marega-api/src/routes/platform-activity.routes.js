
const express = require("express");

const pool = require("../config/database");

const {
    authenticatePlatformAdmin
} = require("../middleware/platformAdmin.middleware");

const router = express.Router();

// Réserver tout le module aux administrateurs de plateforme.
router.use(authenticatePlatformAdmin);

// GET /api/platform/activity
// Lire les événements d'authentification de la plateforme.
router.get("/", async (req, res) => {
    try {
        const requestedLimit = Number(req.query.limit);
        const requestedOffset = Number(req.query.offset);

        const limit =
            Number.isInteger(requestedLimit) &&
            requestedLimit > 0
                ? Math.min(requestedLimit, 100)
                : 50;

        const offset =
            Number.isInteger(requestedOffset) &&
            requestedOffset >= 0
                ? requestedOffset
                : 0;

        const result = await pool.query(
            `
            SELECT
                a.id,
                a.user_id,
                a.action,
                a.module,
                a.entity_id,
                a.details,
                a.created_at,
                u.first_name,
                u.last_name,
                u.email
            FROM marega.audit_logs a
            LEFT JOIN marega.users u
                ON u.id = a.user_id
            WHERE a.module = $1
            ORDER BY a.created_at DESC, a.id DESC
            LIMIT $2
            OFFSET $3
            `,
            [
                "platform_auth",
                limit,
                offset
            ]
        );

        return res.json({
            success: true,
            activities: result.rows,
            pagination: {
                limit,
                offset,
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error(
            "PLATFORM ACTIVITY GET ERROR:",
            error
        );

        return res.status(500).json({
            error:
                "Erreur lors du chargement de l'activité de la plateforme."
        });
    }
});

module.exports = router;
