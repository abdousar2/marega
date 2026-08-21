import "./Stats.css";

const stats = [
    {
        number: "01",
        title: "Plateforme centralisée",
        text: "Un espace unique pour piloter votre patrimoine immobilier."
    },

    {
        number: "06+",
        title: "Modules de gestion",
        text: "Du patrimoine immobilier aux finances et à la traçabilité."
    },

    {
        number: "04",
        title: "Niveaux d'accès",
        text: "Une gestion adaptée aux différents profils de votre équipe."
    },

    {
        number: "24/7",
        title: "Accès aux données",
        text: "Retrouvez vos informations de gestion depuis votre plateforme."
    }
];


export default function Stats() {

    return (

        <section className="stats">

            <div className="stats-container">

                <div className="stats-grid">

                    {stats.map(item => (

                        <div
                            key={item.number}
                            className="stats-item"
                        >

                            <div className="stats-number">
                                {item.number}
                            </div>


                            <h3 className="stats-title">
                                {item.title}
                            </h3>


                            <p className="stats-text">
                                {item.text}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

}