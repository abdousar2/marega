import { NavLink } from "react-router-dom";
import "./CTA.css";


export default function CTA() {

    return (

        <section
            id="contact"
            className="cta"
        >

            <div className="cta-container">


                {/* =================================================
                    INTRODUCTION
                ================================================= */}

                <p className="cta-eyebrow">
                    Passez à une gestion plus simple
                </p>


                <h2 className="cta-title">
                    Votre agence mérite une
                    <br className="cta-title-break" />
                    gestion immobilière moderne.
                </h2>


                <p className="cta-description">
                    Centralisez votre patrimoine, simplifiez
                    votre gestion locative et gardez une vision
                    claire de vos finances avec TECHTRADISPORT.
                </p>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="cta-actions">

                    <NavLink
                        to="/contact"
                        className="cta-button cta-button-primary"
                    >
                        Demander une démonstration
                    </NavLink>


                    <NavLink
                        to="/contact"
                        className="cta-button cta-button-secondary"
                    >
                        Nous contacter
                    </NavLink>

                </div>


                {/* =================================================
                    AVANTAGES
                ================================================= */}

                <div className="cta-benefits">

                    <span>
                        ✓ Gestion immobilière
                    </span>

                    <span>
                        ✓ Gestion financière
                    </span>

                    <span>
                        ✓ Traçabilité & audit
                    </span>

                    <span>
                        ✓ Accès sécurisé
                    </span>

                </div>

            </div>

        </section>

    );

}