import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Stats from "../../components/Stats";
import Features from "./Features";
import ClientReference from "../../components/ClientReference";
import Footer from "../../components/Footer";

import { NavLink } from "react-router-dom";

import "./PublicHome.css";


export default function PublicHome() {

    return (

        <div className="public-home">

            <Navbar />

            <main>

                {/* =================================================
                    HERO
                ================================================= */}

                <Hero />


                {/* =================================================
                    CHIFFRES / POSITIONNEMENT
                ================================================= */}

                <Stats />


                {/* =================================================
                    FONCTIONNALITÉS
                ================================================= */}

                <Features />


                {/* =================================================
                    RÉFÉRENCE
                ================================================= */}

                <ClientReference />


                {/* =================================================
                    CTA FINAL
                ================================================= */}

                <section className="home-cta">

                    <div className="home-cta-decoration" />

                    <div className="home-cta-container">

                        <p className="home-cta-eyebrow">
                            Passez à une gestion plus simple
                        </p>


                        <h2 className="home-cta-title">
                            Votre agence mérite
                            <span>
                                une meilleure organisation.
                            </span>
                        </h2>


                        <p className="home-cta-description">
                            Découvrez comment TECHTRADISPORT peut
                            centraliser votre patrimoine et simplifier
                            votre gestion quotidienne.
                        </p>


                        <div className="home-cta-actions">

                            <NavLink
                                to="/contact"
                                className="home-cta-primary"
                            >
                                Demander une démonstration
                            </NavLink>


                            <NavLink
                                to="/fonctionnalites"
                                className="home-cta-secondary"
                            >
                                Voir les fonctionnalités
                            </NavLink>

                        </div>

                    </div>

                </section>

            </main>


            <Footer />

        </div>

    );

}