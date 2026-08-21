import "./ClientReference.css";

export default function ClientReference() {

    return (

        <section
            id="reference"
            className="client-reference"
        >

            <div className="client-reference-container">


                {/* =================================================
                    INTRODUCTION
                ================================================= */}

                <div className="client-reference-intro">

                    <p className="client-reference-eyebrow">
                        Première référence
                    </p>


                    <h2 className="client-reference-title">
                        Une plateforme déjà utilisée
                        <br className="client-reference-title-break" />
                        par des professionnels.
                    </h2>


                    <p className="client-reference-description">
                        TECHTRADISPORT accompagne déjà des
                        professionnels de l'immobilier dans la
                        digitalisation de leur gestion quotidienne.
                    </p>

                </div>


                {/* =================================================
                    CLIENT
                ================================================= */}

                <div className="client-reference-card">

                    <div className="client-reference-grid">


                        {/* =================================================
                            IDENTITÉ
                        ================================================= */}

                        <div className="client-reference-identity">

                            <p className="client-reference-label">
                                Notre premier client
                            </p>


                            <h3 className="client-reference-name">
                                IBM MAREGA
                            </h3>


                            <p className="client-reference-text">
                                Agence immobilière et gestionnaire
                                de patrimoine à Dakar, IBM MAREGA
                                utilise TECHTRADISPORT pour
                                structurer et centraliser sa gestion
                                immobilière.
                            </p>


                            <div className="client-reference-status">

                                <span className="client-reference-status-dot" />

                                Plateforme en exploitation

                            </div>

                        </div>


                        {/* =================================================
                            USAGES
                        ================================================= */}

                        <div className="client-reference-usage">

                            <h4 className="client-reference-usage-title">
                                Une gestion centralisée
                            </h4>


                            <div className="client-reference-usage-list">


                                {/* PATRIMOINE */}

                                <div className="client-reference-usage-item">

                                    <span className="client-reference-usage-icon">
                                        🏢
                                    </span>


                                    <div>

                                        <h5>
                                            Patrimoine immobilier
                                        </h5>

                                        <p>
                                            Immeubles et appartements
                                            regroupés dans une seule
                                            interface.
                                        </p>

                                    </div>

                                </div>


                                {/* LOCATION */}

                                <div className="client-reference-usage-item">

                                    <span className="client-reference-usage-icon">
                                        👥
                                    </span>


                                    <div>

                                        <h5>
                                            Gestion locative
                                        </h5>

                                        <p>
                                            Locataires, contrats et
                                            loyers suivis depuis la
                                            même plateforme.
                                        </p>

                                    </div>

                                </div>


                                {/* FINANCES */}

                                <div className="client-reference-usage-item">

                                    <span className="client-reference-usage-icon">
                                        💰
                                    </span>


                                    <div>

                                        <h5>
                                            Gestion financière
                                        </h5>

                                        <p>
                                            Paiements, dépenses,
                                            quittances et rapports
                                            financiers centralisés.
                                        </p>

                                    </div>

                                </div>


                                {/* SÉCURITÉ */}

                                <div className="client-reference-usage-item">

                                    <span className="client-reference-usage-icon">
                                        🛡️
                                    </span>


                                    <div>

                                        <h5>
                                            Sécurité & traçabilité
                                        </h5>

                                        <p>
                                            Rôles, permissions et
                                            journal d'audit pour une
                                            gestion transparente.
                                        </p>

                                    </div>

                                </div>


                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

}