const jwt = require("jsonwebtoken");


function authenticatePlatformAdmin(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                error:
                    "Authentification requise."

            });

        }


        const parts =
            authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({

                error:
                    "Format du token invalide."

            });

        }


        const token = parts[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        if (
            decoded.role !==
            "PLATFORM_ADMIN"
        ) {

            return res.status(403).json({

                error:
                    "Accès réservé à l'administration TECHTRADISPORT."

            });

        }


        req.user = decoded;


        next();

    }

    catch (error) {

        console.error(
            "Erreur authentification plateforme :",
            error
        );


        return res.status(401).json({

            error:
                "Session invalide ou expirée."

        });

    }

}


module.exports = {
    authenticatePlatformAdmin
};