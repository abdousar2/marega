const bcrypt = require("bcryptjs");

const User =
    require("../models/user.model");

const AuditService =
    require("../services/audit.service");


// =========================================================
// RÔLES AUTORISÉS
// =========================================================

const ALLOWED_ROLES = [
    "ADMIN",
    "RESPONSABLE",
    "COMPTABLE",
    "AGENT"
];


class UsersController {


    // =====================================================
    // LISTE DES UTILISATEURS
    // ADMIN UNIQUEMENT
    // =====================================================

    static async getAll(req, res) {

        try {

            const users =
                await User.getAll();

            res.json(users);

        }

        catch (err) {

            console.error(
                "Erreur getAll users :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors du chargement des utilisateurs."

            });

        }

    }


    // =====================================================
    // UTILISATEUR PAR ID
    // ADMIN UNIQUEMENT
    // =====================================================

    static async getById(req, res) {

        try {

            const user =
                await User.findById(
                    req.params.id
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

            console.error(
                "Erreur getById user :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors du chargement de l'utilisateur."

            });

        }

    }


    // =====================================================
    // CRÉATION
    // ADMIN UNIQUEMENT
    // =====================================================

    static async create(req, res) {

        try {

            const {
                first_name,
                last_name,
                email,
                password,
                role
            } = req.body;


            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (
                !first_name ||
                !last_name ||
                !email ||
                !password ||
                !role
            ) {

                return res.status(400).json({

                    error:
                        "Tous les champs obligatoires doivent être renseignés."

                });

            }


            // ---------------------------------------------
            // RÔLE
            // ---------------------------------------------

            if (
                !ALLOWED_ROLES.includes(role)
            ) {

                return res.status(400).json({

                    error:
                        "Rôle utilisateur invalide."

                });

            }


            // ---------------------------------------------
            // EMAIL
            // ---------------------------------------------

            const existingUser =
                await User.findByEmail(
                    email.trim()
                );


            if (existingUser) {

                return res.status(409).json({

                    error:
                        "Un utilisateur avec cet email existe déjà."

                });

            }


            // ---------------------------------------------
            // MOT DE PASSE
            // ---------------------------------------------

            if (password.length < 8) {

                return res.status(400).json({

                    error:
                        "Le mot de passe doit contenir au moins 8 caractères."

                });

            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            // ---------------------------------------------
            // CRÉATION
            // ---------------------------------------------

            const user =
                await User.create({

                    first_name:
                        first_name.trim(),

                    last_name:
                        last_name.trim(),

                    email:
                        email.trim().toLowerCase(),

                    password_hash:
                        passwordHash,

                    role,

                    active:
                        true

                });


            await AuditService.log(req, {

                action: "CREATE",

                module: "users",

                entity_id: user.id,

                details: {

                    first_name:
                        user.first_name,

                    last_name:
                        user.last_name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });


            res.status(201).json(user);

        }

        catch (err) {

            console.error(
                "Erreur create user :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors de la création de l'utilisateur."

            });

        }

    }


    // =====================================================
    // MODIFICATION
    // ADMIN UNIQUEMENT
    // =====================================================

    static async update(req, res) {

        try {

            const id =
                Number(req.params.id);


            const {
                first_name,
                last_name,
                email,
                role,
                active
            } = req.body;


            // ---------------------------------------------
            // EMPÊCHER L'ADMIN DE MODIFIER SON PROPRE
            // RÔLE OU SON PROPRE STATUT
            // ---------------------------------------------

            if (
                id === req.user.id &&
                (
                    role !== "ADMIN" ||
                    active === false
                )
            ) {

                return res.status(403).json({

                    error:
                        "Vous ne pouvez pas désactiver ou retirer votre propre rôle ADMIN."

                });

            }


            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (
                !first_name ||
                !last_name ||
                !email ||
                !role
            ) {

                return res.status(400).json({

                    error:
                        "Tous les champs obligatoires doivent être renseignés."

                });

            }


            if (
                !ALLOWED_ROLES.includes(role)
            ) {

                return res.status(400).json({

                    error:
                        "Rôle utilisateur invalide."

                });

            }


            // ---------------------------------------------
            // VÉRIFIER L'UTILISATEUR
            // ---------------------------------------------

            const existingUser =
                await User.findById(id);


            if (!existingUser) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable."

                });

            }


            // ---------------------------------------------
            // VÉRIFIER L'EMAIL
            // ---------------------------------------------

            const emailUser =
                await User.findByEmail(
                    email.trim()
                );


            if (
                emailUser &&
                emailUser.id !== id
            ) {

                return res.status(409).json({

                    error:
                        "Cet email est déjà utilisé."

                });

            }


            // ---------------------------------------------
            // MODIFICATION
            // ---------------------------------------------

            const user =
                await User.update(

                    id,

                    {

                        first_name:
                            first_name.trim(),

                        last_name:
                            last_name.trim(),

                        email:
                            email.trim().toLowerCase(),

                        role,

                        active:
                            active !== false

                    }

                );

                await AuditService.log(req, {

                    action: "UPDATE",

                    module: "users",

                    entity_id: user.id,

                    details: {

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


            res.json(user);            

        }

        catch (err) {

            console.error(
                "Erreur update user :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors de la modification de l'utilisateur."

            });

        }

    }


    // =====================================================
    // MODIFICATION DU MOT DE PASSE
    // ADMIN UNIQUEMENT
    // =====================================================

    static async updatePassword(req, res) {

        try {

            const id =
                Number(req.params.id);


            const {
                password
            } = req.body;


            if (!password) {

                return res.status(400).json({

                    error:
                        "Le mot de passe est obligatoire."

                });

            }


            if (password.length < 8) {

                return res.status(400).json({

                    error:
                        "Le mot de passe doit contenir au moins 8 caractères."

                });

            }


            const user =
                await User.findById(id);


            if (!user) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable."

                });

            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            await User.updatePassword(

                id,

                passwordHash

            );

            await AuditService.log(req, {

                action: "PASSWORD_CHANGE",

                module: "users",

                entity_id: id,

                details: {

                    email:
                        user.email

                }

            });


            res.json({

                success: true,

                message:
                    "Mot de passe mis à jour."

            });

        }

        catch (err) {

            console.error(
                "Erreur update password :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors de la modification du mot de passe."

            });

        }

    }


    // =====================================================
    // ACTIVATION / DÉSACTIVATION
    // ADMIN UNIQUEMENT
    // =====================================================

    static async updateActive(req, res) {

        try {

            const id =
                Number(req.params.id);


            const {
                active
            } = req.body;


            if (
                typeof active !== "boolean"
            ) {

                return res.status(400).json({

                    error:
                        "La valeur active doit être true ou false."

                });

            }


            // ---------------------------------------------
            // EMPÊCHER L'ADMIN DE SE DÉSACTIVER
            // ---------------------------------------------

            if (
                id === req.user.id &&
                active === false
            ) {

                return res.status(403).json({

                    error:
                        "Vous ne pouvez pas désactiver votre propre compte."

                });

            }


            const user =
                await User.findById(id);


            if (!user) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable."

                });

            }


            const updatedUser =
                await User.updateActive(

                    id,

                    active

                );

                await AuditService.log(req, {

                    action: active
                        ? "ACTIVATE"
                        : "DEACTIVATE",

                    module: "users",

                    entity_id: id,

                    details: {

                        email:
                            updatedUser.email,

                        active:
                            updatedUser.active

                    }
                });

            res.json(updatedUser);

        }

        catch (err) {

            console.error(
                "Erreur update active :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors de la modification du statut."

            });

        }

    }


    // =====================================================
    // SUPPRESSION
    // ADMIN UNIQUEMENT
    // =====================================================

    static async remove(req, res) {

        try {

            const id =
                Number(req.params.id);


            // ---------------------------------------------
            // EMPÊCHER LA SUPPRESSION DE SON PROPRE COMPTE
            // ---------------------------------------------

            if (
                id === req.user.id
            ) {

                return res.status(403).json({

                    error:
                        "Vous ne pouvez pas supprimer votre propre compte."

                });

            }


            const user =
                await User.findById(id);


            if (!user) {

                return res.status(404).json({

                    error:
                        "Utilisateur introuvable."

                });

            }


            await User.delete(id);

            await AuditService.log(req, {

                action: "DELETE",

                module: "users",

                entity_id: id,

                details: {

                    first_name:
                        user.first_name,

                    last_name:
                        user.last_name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });


            res.json({

                success: true

            });

        }

        catch (err) {

            console.error(
                "Erreur delete user :",
                err
            );

            res.status(500).json({

                error:
                    "Erreur lors de la suppression de l'utilisateur."

            });

        }

    }

}


module.exports =
    UsersController;