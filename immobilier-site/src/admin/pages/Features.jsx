import Navbar from "../../components/Navbar";
import FeaturesSection from "../../components/Features";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

import "./FeaturesPage.css";

export default function Features() {
    return (
        <>
            <Navbar />

            <main className="features-page">

                {/* =================================================
                    INTRODUCTION DE LA PAGE
                ================================================= */}

                <section className="features-page-hero">

                    <div className="features-page-hero-container">

                        <p className="features-page-eyebrow">
                            Fonctionnalités
                        </p>

                        <h1 className="features-page-title">
                            Tout ce qu'il faut pour
                            <br />
                            gérer votre patrimoine
                        </h1>

                        <p className="features-page-description">
                            Une plateforme conçue pour simplifier
                            la gestion quotidienne des agences
                            immobilières.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    FONCTIONNALITÉS
                ================================================= */}

                <FeaturesSection />


                {/* =================================================
                    CTA
                ================================================= */}

                <CTA />

            </main>

            <Footer />
        </>
    );
}