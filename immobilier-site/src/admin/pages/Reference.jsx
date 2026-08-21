import Navbar from "../../components/Navbar";
import ClientReference from "../../components/ClientReference";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

import "./Reference.css";

export default function Reference() {

    return (
        <>
            <Navbar />

            <main className="reference-page">

                {/* =================================================
                    INTRODUCTION
                ================================================= */}

                <section className="reference-hero">

                    <div className="reference-hero-container">

                        <p className="reference-eyebrow">
                            Notre première référence
                        </p>

                        <h1 className="reference-title">
                            IBM MAREGA
                        </h1>

                        <p className="reference-description">
                            IBM MAREGA est la première agence
                            immobilière à utiliser TECHTRADISPORT
                            pour la gestion de son patrimoine
                            immobilier.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    RÉFÉRENCE CLIENT
                ================================================= */}

                <ClientReference />


                {/* =================================================
                    CTA
                ================================================= */}

                <CTA />

            </main>

            <Footer />
        </>
    );
}