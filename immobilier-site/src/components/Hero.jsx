import { NavLink } from "react-router-dom";
import "./Hero.css";

export default function Hero() {
    return (
        <section className="hero">

            {/* IMAGE DE FOND */}
            <div
                className="hero-background"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=85')"
                }}
            />

            {/* OVERLAY */}
            <div className="hero-overlay" />
            <div className="hero-gradient" />

            {/* CONTENU */}
            <div className="hero-container">

                <div className="hero-content">

                    {/* BADGE */}
                    <div className="hero-badge">

                        <span className="hero-badge-dot" />

                        Plateforme de gestion immobilière

                    </div>


                    {/* TITRE */}
                    <h1 className="hero-title">

                        Gérez votre patrimoine

                        <span className="hero-title-blue">
                            immobilier
                        </span>

                        plus simplement.

                    </h1>


                    {/* DESCRIPTION */}
                    <p className="hero-description">

                        TECHTRADISPORT accompagne les agences
                        immobilières et les gestionnaires de patrimoine
                        dans la gestion de leurs immeubles, appartements,
                        locataires, contrats, loyers et finances depuis
                        une plateforme unique.

                    </p>


                    {/* BOUTONS */}
                    <div className="hero-actions">

                        <NavLink
                            to="/solution"
                            className="hero-button hero-button-primary"
                        >
                            Découvrir la solution
                        </NavLink>


                        <NavLink
                            to="/contact"
                            className="hero-button hero-button-secondary"
                        >
                            Demander une démonstration
                        </NavLink>

                    </div>


                    {/* PREUVE */}
                    <div className="hero-proof">

                        <div className="hero-proof-item">

                            <span className="hero-proof-dot" />

                            <span>
                                Plateforme en exploitation
                            </span>

                        </div>


                        <div className="hero-proof-reference">

                            Première référence :

                            <strong>
                                IBM MAREGA
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* INDICATEUR */}
            <div className="hero-indicator">
                Découvrez TECHTRADISPORT
            </div>

        </section>
    );
}