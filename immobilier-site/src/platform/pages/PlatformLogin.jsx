import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PlatformAuthService
    from "../../services/platformAuth.service";

import "../styles/PlatformLogin.css";


export default function PlatformLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            await PlatformAuthService.login({
                email,
                password
            });

            navigate("/platform");

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


    return (

        <div className="platform-login-page">

            <div className="platform-login-container">


                {/* =====================================================
                    IDENTITÉ
                ===================================================== */}

                <div className="platform-login-brand">

                    <div className="platform-login-logo">
                        T
                    </div>

                    <h1>
                        TECHTRADISPORT
                    </h1>

                    <p>
                        Administration de la plateforme
                    </p>

                </div>


                {/* =====================================================
                    CARTE
                ===================================================== */}

                <div className="platform-login-card">


                    {/* EN-TÊTE */}

                    <div className="platform-login-heading">

                        <span className="platform-login-badge">

                            <span className="platform-login-badge-dot" />

                            ESPACE PLATEFORME

                        </span>


                        <h2>
                            Bienvenue
                        </h2>


                        <p>
                            Connectez-vous à l'administration
                            TECHTRADISPORT.
                        </p>

                    </div>


                    {/* ERREUR */}

                    {error && (

                        <div className="platform-login-error">

                            <span className="platform-login-error-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        FORMULAIRE
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="platform-login-form"
                    >


                        {/* EMAIL */}

                        <div className="platform-login-field">

                            <label htmlFor="platform-email">
                                Adresse email
                            </label>


                            <div className="platform-login-input-wrapper">

                                <span className="platform-login-input-icon">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
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

                                </span>


                                <input
                                    id="platform-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="admin@techtradisport.sn"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* MOT DE PASSE */}

                        <div className="platform-login-field">

                            <label htmlFor="platform-password">
                                Mot de passe
                            </label>


                            <div className="platform-login-input-wrapper">

                                <span className="platform-login-input-icon">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
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

                                </span>


                                <input
                                    id="platform-password"
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


                        {/* BOUTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="platform-login-button"
                        >

                            {loading ? (

                                <>

                                    <span className="platform-login-spinner" />

                                    <span>
                                        Connexion...
                                    </span>

                                </>

                            ) : (

                                <>

                                    <span>
                                        Se connecter
                                    </span>

                                    <span className="platform-login-arrow">
                                        →
                                    </span>

                                </>

                            )}

                        </button>

                    </form>

                </div>


                {/* =====================================================
                    FOOTER
                ===================================================== */}

                <div className="platform-login-footer">

                    <span>
                        TECHTRADISPORT
                    </span>

                    <span className="platform-login-footer-separator">
                        •
                    </span>

                    <span>
                        Administration sécurisée
                    </span>

                </div>

            </div>

        </div>

    );

}