import "./HowItWorks.css";

const steps = [
    {
        number: "01",
        title: "Souscrivez à TECHTRADISPORT",
        text:
            "Votre agence dispose de son propre espace de gestion et peut commencer à organiser son patrimoine immobilier.",
    },
    {
        number: "02",
        title: "Centralisez votre patrimoine",
        text:
            "Immeubles, appartements, locataires et contrats sont regroupés afin de disposer d'une vision complète de votre parc immobilier.",
    },
    {
        number: "03",
        title: "Pilotez votre activité",
        text:
            "Gérez les loyers, les paiements, les dépenses et consultez votre situation financière depuis une interface unique.",
    },
    {
        number: "04",
        title: "Gardez le contrôle",
        text:
            "Les rôles, permissions, opérations et journaux d'audit renforcent la sécurité et la transparence de votre gestion.",
    },
];


export default function HowItWorks() {

    return (

        <section className="how-it-works">

            <div className="how-it-works-container">


                {/* =================================================
                    INTRODUCTION
                ================================================= */}

                <div className="how-it-works-intro">

                    <p className="how-it-works-eyebrow">
                        Comment ça fonctionne
                    </p>


                    <h2 className="how-it-works-title">
                        Une gestion immobilière pensée
                        <br className="how-it-works-title-break" />
                        pour les professionnels.
                    </h2>


                    <p className="how-it-works-description">
                        TECHTRADISPORT accompagne votre agence
                        depuis la centralisation de votre patrimoine
                        jusqu'au suivi quotidien de votre activité.
                    </p>

                </div>


                {/* =================================================
                    ÉTAPES
                ================================================= */}

                <div className="how-it-works-grid">

                    {steps.map((step) => (

                        <article
                            key={step.number}
                            className="how-it-works-card"
                        >

                            <div className="how-it-works-card-top">

                                <span className="how-it-works-number">
                                    {step.number}
                                </span>


                                <span className="how-it-works-badge">
                                    {step.number}
                                </span>

                            </div>


                            <h3 className="how-it-works-card-title">
                                {step.title}
                            </h3>


                            <p className="how-it-works-card-text">
                                {step.text}
                            </p>

                        </article>

                    ))}

                </div>

            </div>

        </section>

    );

}