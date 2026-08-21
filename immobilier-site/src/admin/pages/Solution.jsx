import Navbar from "../../components/Navbar";
import HowItWorks from "../../components/HowItWorks";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

import "./Solution.css";

export default function Solution() {

    return (
        <>
            <Navbar />

            <main className="solution-page">

                {/* =====================================================
                    INTRODUCTION
                ===================================================== */}

                <section className="solution-hero">

                    <div className="solution-hero-container">

                        <p className="solution-eyebrow">
                            La solution TECHTRADISPORT
                        </p>

                        <h1 className="solution-title">
                            Une gestion immobilière
                            <br />
                            plus simple et plus intelligente.
                        </h1>

                        <p className="solution-description">
                            TECHTRADISPORT permet aux agences
                            immobilières et aux gestionnaires de
                            patrimoine de centraliser leur activité,
                            de piloter leurs opérations et de garder
                            une vision claire de leur patrimoine.
                        </p>

                    </div>

                </section>


                {/* =====================================================
                    COMMENT ÇA FONCTIONNE
                ===================================================== */}

                <HowItWorks />


                {/* =====================================================
                    CTA
                ===================================================== */}

                <CTA />

            </main>


            {/* =========================================================
                FOOTER
            ========================================================= */}

            <Footer />
        </>
    );
}