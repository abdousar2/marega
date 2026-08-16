const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {

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


        const token =
            parts[1];


        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET

            );


        req.user = decoded;


        next();

    }

    catch (err) {

        console.error(
            "Erreur authentification :",
            err.message
        );


        return res.status(401).json({

            error:
                "Session invalide ou expirée."

        });

    }

}


function authorizeRoles(...roles) {

    return (req, res, next) => {


        if (!req.user) {

            return res.status(401).json({

                error:
                    "Authentification requise."

            });

        }


        if (
            !roles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({

                error:
                    "Vous n'avez pas les droits nécessaires."

            });

        }


        next();

    };

}


module.exports = {

    authenticateToken,

    authorizeRoles

};