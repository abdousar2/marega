const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User =
    require("../models/user.model");

const AuditService =
    require("../services/audit.service");


class PlatformAuthController {


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


            if (
                user.role !==
                "PLATFORM_ADMIN"
            ) {

                return res.status(403).json({

                    error:
                        "Ce compte n'est pas un administrateur TECHTRADISPORT."

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
                        role: user.role,
                        scope: "platform"
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "12h"
                    }

                );


            await AuditService.log(req, {

                user_id: user.id,

                action: "PLATFORM_LOGIN",

                module: "platform_auth",

                entity_id: user.id,

                details: {

                    email: user.email,

                    role: user.role

                }

            });


            return res.json({

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

        catch (error) {

            console.error(
                "Erreur login plateforme :",
                error
            );


            return res.status(500).json({

                error:
                    "Erreur lors de la connexion."

            });

        }

    }


    static async me(req, res) {

        try {

            const user =
                await User.findById(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({

                    error:
                        "Administrateur introuvable."

                });

            }


            if (
                user.role !==
                "PLATFORM_ADMIN"
            ) {

                return res.status(403).json({

                    error:
                        "Accès interdit."

                });

            }


            return res.json(user);

        }

        catch (error) {

            console.error(
                "Erreur profil plateforme :",
                error
            );


            return res.status(500).json({

                error:
                    "Erreur lors du chargement du profil."

            });

        }

    }

}


module.exports =
    PlatformAuthController;