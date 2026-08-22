import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import AuthService from "../../services/auth.service";
import "./Login.css";

export default function Login() {

    const navigate = useNavigate();


    /* =========================================================
       AGENCE SÉLECTIONNÉE
    ========================================================= */

    const [agency] = useState(() => {

        try {

            const storedAgency =
                sessionStorage.getItem(
                    "techtradisport_selected_agency"
                );

            if (!storedAgency) {
                return null;
            }

            return JSON.parse(storedAgency);

        } catch (error) {

            console.error(
                "Erreur récupération agence :",
                error
            );

            sessionStorage.removeItem(
                "techtradisport_selected_agency"
            );

            return null;

        }

    });


    /* =========================================================
       FORMULAIRE
    ========================================================= */

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");   

    const handleChangeAgency = () => {

        sessionStorage.removeItem(
            "techtradisport_selected_agency"
        );

        navigate("/connexion");
    };


    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            if (!agency?.id) {

                setError(
                    "Veuillez d'abord sélectionner votre agence."
                );

                return;

            }

            await AuthService.login({

                email,

                password,

                agency_id: agency.id

            });

            navigate("/admin");

        }

        catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Impossible de se connecter."
            );

        }

        finally {

            setLoading(false);

        }

    }

    if (!agency) {

        return (

            <div className="login-no-agency">

                <div className="login-no-agency-card">

                    <div className="login-no-agency-icon">
                        M
                    </div>

                    <h1>
                        Sélectionnez votre agence
                    </h1>

                    <p>
                        Vous devez sélectionner votre agence
                        avant de vous connecter.
                    </p>

                    <NavLink to="/connexion">
                        Choisir mon agence
                    </NavLink>

                </div>

            </div>

        );

    }
 
    return (
        <div className="login-page">

            {/* =====================================================
                PANNEAU GAUCHE
            ====================================================== */}

            <section className="login-left-panel">

                {/* Décorations */}

                <div className="login-decoration login-decoration-top" />

                <div className="login-decoration login-decoration-bottom" />

                <div className="login-decoration login-decoration-circle" />


                {/* Contenu */}

                <div className="login-left-content">

                    {/* LOGO */}

                    <div className="login-logo-wrapper">

                        <img
                            src="/images/logo-ibm-marega.png"
                            alt="IBM MAREGA"
                            className="login-logo"
                        />

                    </div>


                    {/* Petit titre */}

                    <div className="login-eyebrow">

                        <span className="login-eyebrow-line" />

                        <p>
                            Administration immobilière
                        </p>

                    </div>


                    {/* Gros titre */}

                    <h2 className="login-main-title">

                        Gérez votre
                        <br />

                        <span>
                            patrimoine
                        </span>

                        <br />

                        immobilier.

                    </h2>


                    {/* Description */}

                    <p className="login-description">

                        Une plateforme unique pour piloter vos immeubles,
                        appartements, locataires, contrats et paiements
                        avec simplicité.

                    </p>

                </div>


                {/* Cartes */}

                <div className="login-feature-grid">

                    <div className="login-feature-card">

                        <div className="login-feature-icon">
                            ✓
                        </div>

                        <div>

                            <p className="login-feature-title">
                                Gestion centralisée
                            </p>

                            <p className="login-feature-description">
                                Tout votre patrimoine au même endroit
                            </p>

                        </div>

                    </div>


                    <div className="login-feature-card">

                        <div className="login-feature-icon">
                            ✓
                        </div>

                        <div>

                            <p className="login-feature-title">
                                Suivi simplifié
                            </p>

                            <p className="login-feature-description">
                                Une vision claire de votre activité
                            </p>

                        </div>

                    </div>

                </div>


                {/* Footer gauche */}

                <div className="login-left-footer">

                    <span>
                        Copyright © 2026 TechTradiSport.
                    </span>

                    <span>
                        Powered by ArS.
                    </span>

                </div>

            </section>


            {/* =====================================================
                PANNEAU DROIT
            ====================================================== */}

            <main className="login-right-panel">

                <div className="login-form-container">


                    {/* Logo mobile */}

                    <div className="login-mobile-brand">

                        <div className="login-mobile-logo">
                            M
                        </div>

                        <div>

                            <h2>
                                MAREGA
                            </h2>

                            <p>
                                Administration immobilière
                            </p>

                        </div>

                    </div>


                    {/* En-tête */}

                    <div className="login-header">

                        <div className="login-badge">

                            <span />

                            <span>
                                ESPACE ADMINISTRATION
                            </span>

                        </div>


                        {/* Agence sélectionnée */}

                        {agency && (

                            <div className="login-agency">

                                <div className="login-agency-info">

                                    <div className="login-agency-icon">

                                        {agency.name
                                            ?.charAt(0)
                                            ?.toUpperCase()
                                        }

                                    </div>

                                    <div>

                                        <p className="login-agency-label">
                                            Agence sélectionnée
                                        </p>

                                        <p className="login-agency-name">
                                            {agency.name}
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={handleChangeAgency}
                                    className="login-change-agency"
                                >
                                    Changer
                                </button>

                            </div>

                        )}


                        <h1>
                            Bienvenue
                        </h1>


                        <p>
                            Connectez-vous à votre espace de gestion MAREGA.
                        </p>

                    </div>


                    {/* Erreur */}

                    {error && (

                        <div className="login-error">

                            <span className="login-error-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* Formulaire */}

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        {/* Email */}

                        <div className="login-field">

                            <label>
                                Adresse email
                            </label>

                            <div className="login-input-wrapper">

                                <div className="login-input-icon">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.7"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25Z"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m3 7 7.2 4.8a3.25 3.25 0 003.6 0L21 7"
                                        />

                                    </svg>

                                </div>


                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="exemple@marega.sn"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* Mot de passe */}

                        <div className="login-field">

                            <label>
                                Mot de passe
                            </label>

                            <div className="login-input-wrapper">

                                <div className="login-input-icon">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.7"
                                        stroke="currentColor"
                                    >

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75"
                                        />

                                        <rect
                                            width="13.5"
                                            height="10.5"
                                            x="5.25"
                                            y="10.5"
                                            rx="2.25"
                                        />

                                    </svg>

                                </div>


                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Votre mot de passe"
                                    autoComplete="current-password"
                                    required
                                />

                            </div>

                        </div>


                        {/* Bouton */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-submit"
                        >

                            {loading ? (

                                <>
                                    <span className="login-spinner" />

                                    <span>
                                        Connexion...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <span>
                                        Se connecter
                                    </span>

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                        />
                                    </svg>
                                </>

                            )}

                        </button>

                    </form>


                    {/* Footer */}

                    <div className="login-right-footer">

                        <p>
                            MAREGA
                            <span>•</span>
                            Gestion immobilière
                        </p>

                        <p>
                            Accès sécurisé
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}