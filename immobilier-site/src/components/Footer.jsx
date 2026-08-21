import "./Footer.css";

export default function Footer() {
    return (
        <footer className="site-footer">

            <div className="site-footer-container">

                <div className="site-footer-grid">

                    {/* =========================================
                        ENTREPRISE
                    ========================================= */}

                    <div className="footer-column footer-company">

                        <h3>
                            TECHTRADISPORT
                        </h3>

                        <p>
                            Des solutions numériques conçues pour
                            accompagner les professionnels de
                            l'immobilier dans la gestion de leur
                            patrimoine.
                        </p>

                    </div>


                    {/* =========================================
                        LA SOLUTION
                    ========================================= */}

                    <div className="footer-column">

                        <h4>
                            La solution
                        </h4>

                        <ul>

                            <li>
                                <a href="/solution">
                                    Gestion immobilière
                                </a>
                            </li>

                            <li>
                                <a href="/solution">
                                    Gestion locative
                                </a>
                            </li>

                            <li>
                                <a href="/solution">
                                    Gestion financière
                                </a>
                            </li>

                            <li>
                                <a href="/audit">
                                    Rapports &amp; audit
                                </a>
                            </li>

                        </ul>

                    </div>


                    {/* =========================================
                        TECHTRADISPORT
                    ========================================= */}

                    <div className="footer-column">

                        <h4>
                            TECHTRADISPORT
                        </h4>

                        <ul>

                            <li>
                                <a href="/solution">
                                    À propos
                                </a>
                            </li>

                            <li>
                                <a href="/solution">
                                    Nos solutions
                                </a>
                            </li>

                            <li>
                                <a href="/reference">
                                    Nos clients
                                </a>
                            </li>

                            <li>
                                <a href="/contact">
                                    Contact
                                </a>
                            </li>

                        </ul>

                    </div>


                    {/* =========================================
                        CONTACT
                    ========================================= */}

                    <div className="footer-column">

                        <h4>
                            Contact
                        </h4>

                        <ul className="footer-contact-list">

                            <li>
                                <span>☎</span>
                                <a href="tel:+221338228839">
                                    +221 33 822 88 39
                                </a>
                            </li>

                            <li>
                                <span>✉</span>
                                <a href="mailto:contact@techtradisport.com">
                                    contact@techtradisport.com
                                </a>
                            </li>

                            <li>
                                <span>●</span>
                                <span>
                                    Dakar, Sénégal
                                </span>
                            </li>

                        </ul>

                    </div>

                </div>


                {/* =========================================
                    BAS DE PAGE
                ========================================= */}

                <div className="footer-bottom">

                    <p>
                        © 2026 TECHTRADISPORT.
                        Tous droits réservés.
                    </p>

                    <p>
                        Plateforme de gestion immobilière
                    </p>

                </div>

            </div>

        </footer>
    );
}