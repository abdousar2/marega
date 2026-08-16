const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const AuditService =
    require("../services/audit.service");


class AuthController {


    // =========================================================
    // CONNEXION
    // =========================================================

    static async login(req, res) {

        try {

            const {
                email,
                password
            } = req.body;


            if (!email || !password) {

                return res.status(400).json({

                    error:
                        "Veuillez renseigner votre email et votre mot de passe."

                });

            }


            const user =
                await User.findByEmail(email);


            if (!user) {

                return res.status(401).json({

                    error:
                        "Email ou mot de passe incorrect."

                });

            }


            if (!user.active) {

                return res.status(403).json({

                    error:
                        "Ce compte est désactivé."

                });

            }


            const passwordValid =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );


            if (!passwordValid) {

                return res.status(401).json({

                    error:
                        "Email ou mot de passe incorrect."

                });

            }


            const token =
                jwt.sign(

                    {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "12h"
                    }

                );

            await AuditService.log(req, {

                user_id: user.id,

                action: "LOGIN",

                module: "auth",

                entity_id: user.id,

                details: {

                    email: user.email,

                    role: user.role

                }

            });


            res.json({

                success: true,

                token,

                user: {

                    id: user.id,

                    first_name:
                        user.first_name,

                    last_name:
                        user.last_name,

                    email:
                        user.email,

                    role:
                        user.role,

                    active:
                        user.active

                }

            });

        }

        catch (err) {

            console.error(
                "Erreur login :",
                err
            );


            res.status(500).json({

                error:
                    "Erreur lors de la connexion."

            });

        }

    }


    // =========================================================
    // UTILISATEUR CONNECTÉ
    // =========================================================

    static async me(req, res) {

        try {

            const user =
                await User.findById(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable."

                });

            }


            res.json(user);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                error:
                    "Erreur lors du chargement du profil."

            });

        }

    }

}


module.exports = AuthController;