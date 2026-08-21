import "./Features.css";

const features = [
    {
        icon: "🏢",
        title: "Immeubles",
        description:
            "Centralisez votre patrimoine immobilier et retrouvez rapidement toutes les informations relatives à vos immeubles."
    },
    {
        icon: "🏠",
        title: "Appartements",
        description:
            "Suivez les appartements, leur occupation, leur disponibilité et leurs principales caractéristiques."
    },
    {
        icon: "👤",
        title: "Locataires",
        description:
            "Gérez les informations de vos locataires et conservez une vision claire de votre parc locatif."
    },
    {
        icon: "📄",
        title: "Contrats",
        description:
            "Organisez vos contrats de location et suivez leur état depuis une interface centralisée."
    },
    {
        icon: "📅",
        title: "Loyers",
        description:
            "Suivez les loyers, les échéances et les situations de paiement de votre patrimoine."
    },
    {
        icon: "💳",
        title: "Paiements",
        description:
            "Enregistrez les encaissements et générez des quittances permettant d'assurer un meilleur suivi financier."
    },
    {
        icon: "💸",
        title: "Dépenses",
        description:
            "Enregistrez les dépenses liées à votre patrimoine et gardez une vision précise des sorties financières."
    },
    {
        icon: "🛡️",
        title: "Traçabilité & audit",
        description:
            "Chaque opération importante peut être retracée afin de renforcer la transparence et la sécurité de votre gestion."
    }
];


export default function Features() {

    return (

        <section
            id="fonctionnalites"
            className="features"
        >

            <div className="features-container">


                {/* =================================================
                    INTRODUCTION
                ================================================= */}

                <div className="features-intro">

                    <p className="features-eyebrow">
                        Une gestion centralisée
                    </p>


                    <h2 className="features-title">
                        Tout votre patrimoine immobilier
                        <br className="features-title-break" />
                        au même endroit.
                    </h2>


                    <p className="features-description">
                        TECHTRADISPORT rassemble les outils
                        essentiels à la gestion quotidienne
                        d'une agence immobilière ou d'un
                        gestionnaire de patrimoine.
                    </p>

                </div>


                {/* =================================================
                    CARTES
                ================================================= */}

                <div className="features-grid">

                    {features.map((feature) => (

                        <div
                            key={feature.title}
                            className="feature-card"
                        >

                            <div className="feature-icon">
                                <span>
                                    {feature.icon}
                                </span>
                            </div>


                            <h3 className="feature-title">
                                {feature.title}
                            </h3>


                            <p className="feature-text">
                                {feature.description}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

}