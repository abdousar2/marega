import "./StatsCard.css";

export default function StatCard({
    title,
    value,
    color = "blue",
    icon = "📊"
}) {

    return (

        <div className="ui-stat-card">

            <div
                className={`ui-stat-card-top ui-stat-${color}`}
            />

            <div className="ui-stat-card-content">

                <div className="ui-stat-card-info">

                    <p className="ui-stat-card-title">
                        {title}
                    </p>

                    <h2 className="ui-stat-card-value">
                        {value}
                    </h2>

                </div>


                <div className="ui-stat-card-icon">

                    {icon}

                </div>

            </div>

        </div>

    );

}