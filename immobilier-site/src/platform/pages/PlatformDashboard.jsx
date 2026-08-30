import PlatformSidebar
    from "../components/PlatformSidebar";

import PlatformHeader
    from "../components/PlatformHeader";

import "../styles/platform-dashboard.css";


export default function PlatformDashboard() {

    const cards = [

        {
            label: "Agences",
            value: "1",
            description:
                "Agences actuellement enregistrées"
        },

        {
            label: "Demandes",
            value: "—",
            description:
                "Demandes de contact à traiter"
        },

        {
            label: "Utilisateurs",
            value: "6",
            description:
                "Utilisateurs enregistrés"
        },

        {
            label: "Activité",
            value: "—",
            description:
                "Activité récente de la plateforme"
        }

    ];


    return (

        <div className="platform-dashboard">

            <PlatformSidebar />


            <div className="platform-dashboard-content">

                <PlatformHeader />


                <main className="platform-dashboard-main">


                    {/* =================================================
                        INTRODUCTION
                    ================================================= */}

                    <section className="platform-dashboard-intro">

                        <p className="platform-dashboard-eyebrow">
                            Vue d'ensemble
                        </p>

                        <h2>
                            Tableau de bord
                        </h2>

                        <p className="platform-dashboard-description">
                            Pilotez votre plateforme
                            TECHTRADISPORT depuis cet espace.
                        </p>

                    </section>


                    {/* =================================================
                        STATISTIQUES
                    ================================================= */}

                    <section className="platform-dashboard-stats">

                        {cards.map((card) => (

                            <div
                                key={card.label}
                                className="platform-stat-card"
                            >

                                <p className="platform-stat-label">
                                    {card.label}
                                </p>

                                <p className="platform-stat-value">
                                    {card.value}
                                </p>

                                <p className="platform-stat-description">
                                    {card.description}
                                </p>

                            </div>

                        ))}

                    </section>


                    {/* =================================================
                        BLOC DE BIENVENUE
                    ================================================= */}

                    <section className="platform-dashboard-welcome">

                        <p className="platform-dashboard-eyebrow">
                            Administration TECHTRADISPORT
                        </p>

                        <h3>
                            Bienvenue dans votre espace plateforme.
                        </h3>

                        <p>
                            Cet espace permettra de gérer les agences,
                            leurs administrateurs, les demandes de
                            souscription et l'activité globale de
                            TECHTRADISPORT.
                        </p>

                    </section>


                </main>

            </div>

        </div>

    );

}