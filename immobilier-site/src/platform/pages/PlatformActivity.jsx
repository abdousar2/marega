
import { useEffect, useState } from "react";

import PlatformSidebar
    from "../components/PlatformSidebar";

import PlatformHeader
    from "../components/PlatformHeader";

import "../styles/platform-agencies.css";
import "../styles/platform-activity.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getActionLabel(action) {
    const labels = {
        PLATFORM_LOGIN: "Connexion à la plateforme",
    };

    return labels[action] || action || "Action inconnue";
}

export default function PlatformActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function loadActivities() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem(
                    "techtradisport_platform_token"
                );

                if (!token) {
                    throw new Error(
                        "Session administrateur absente. Veuillez vous reconnecter."
                    );
                }

                const response = await fetch(
                    `${API_URL}/platform/activity?limit=50&offset=0`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Impossible de charger l'activité de la plateforme."
                    );
                }

                if (mounted) {
                    setActivities(
                        Array.isArray(data.activities)
                            ? data.activities
                            : []
                    );
                }
            } catch (err) {
                if (mounted) {
                    setError(
                        err.message ||
                        "Une erreur est survenue."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadActivities();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="platform-agencies platform-activity">
            <PlatformSidebar />

            <div className="platform-agencies-main">
                <PlatformHeader />

                <main className="platform-agencies-content">
                    <section className="platform-agencies-heading">
                        <div>
                            <p className="platform-agencies-eyebrow">
                                Administration plateforme
                            </p>

                            <h2>Activité</h2>

                            <p className="platform-agencies-subtitle">
                                Consultez les événements enregistrés
                                pour l'administration TECHTRADISPORT.
                            </p>
                        </div>
                    </section>

                    <section className="platform-activity-summary">
                        <div className="platform-activity-summary-icon">
                            ↗
                        </div>

                        <div>
                            <p>Événements chargés</p>
                            <strong>
                                {loading ? "…" : activities.length}
                            </strong>
                        </div>
                    </section>

                    <section className="platform-activity-panel">
                        <div className="platform-activity-panel-heading">
                            <div>
                                <h3>Journal d'activité</h3>
                                <p>
                                    Événements d'authentification de la
                                    plateforme, du plus récent au plus ancien.
                                </p>
                            </div>

                            <span className="platform-activity-readonly">
                                Consultation
                            </span>
                        </div>

                        {loading && (
                            <p className="platform-activity-message"
                               role="status">
                                Chargement des événements…
                            </p>
                        )}

                        {!loading && error && (
                            <div className="platform-activity-error"
                                 role="alert">
                                {error}

                                <button
                                    type="button"
                                    onClick={() =>
                                        window.location.reload()
                                    }
                                >
                                    Réessayer
                                </button>
                            </div>
                        )}

                        {!loading && !error && activities.length === 0 && (
                            <p className="platform-activity-message">
                                Aucun événement d'activité à afficher.
                            </p>
                        )}

                        {!loading && !error && activities.length > 0 && (
                            <div className="platform-activity-table-wrapper">
                                <table className="platform-activity-table">
                                    <thead>
                                        <tr>
                                            <th>Date et heure</th>
                                            <th>Administrateur</th>
                                            <th>Adresse e-mail</th>
                                            <th>Événement</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {activities.map((item) => {
                                            const fullName = [
                                                item.first_name,
                                                item.last_name,
                                            ]
                                                .filter(Boolean)
                                                .join(" ");

                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        {formatDate(
                                                            item.created_at
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {fullName ||
                                                                "Compte indisponible"}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {item.email || "—"}
                                                    </td>

                                                    <td>
                                                        <span className="platform-activity-event">
                                                            <span className="platform-activity-event-dot" />
                                                            {getActionLabel(
                                                                item.action
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && !error && activities.length > 0 && (
                            <p className="platform-activity-footer">
                                Affichage des {activities.length} événements
                                retournés par l'API, dans la limite de 50.
                            </p>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
