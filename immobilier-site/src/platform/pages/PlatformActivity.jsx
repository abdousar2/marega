
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
        PLATFORM_USER_CREATED: "Création d'un administrateur",
        PLATFORM_USER_UPDATED: "Modification d'un administrateur",
        PLATFORM_USER_ACTIVATED: "Activation d'un compte",
        PLATFORM_USER_DEACTIVATED: "Désactivation d'un compte",
        PLATFORM_USER_DELETED: "Suppression d'un administrateur",
        PLATFORM_AUDIT_CORRECTION_RECORDED:
            "Rectification du journal d'audit",
    };

    return labels[action] || action || "Action inconnue";
}

function getModuleLabel(module) {
    const labels = {
        platform_auth: "Authentification plateforme",
        platform_users: "Gestion des administrateurs",
    };

    return labels[module] || module || "—";
}

function getDetailLabel(key) {
    const labels = {
        correction_type: "Type de rectification",
        related_audit_log_id: "Identifiant de la trace initiale",
        related_successful_audit_log_id:
            "Trace de la suppression confirmée",
        affected_user_id: "Identifiant du compte concerné",
        affected_email: "Adresse du compte concerné",
        reason: "Explication de la rectification",
        original_entry_preserved: "Trace initiale conservée",
        deleted_user_id: "Administrateur supprimé",
        first_name: "Prénom du compte concerné",
        last_name: "Nom du compte concerné",
        email: "Adresse e-mail du compte concerné",
        role: "Rôle du compte",
        was_active: "Compte actif avant suppression",
        previous_values: "Valeurs précédentes",
        updated_values: "Valeurs mises à jour",
        changes: "Modifications effectuées",
    };

    return labels[key] || key.replace(/_/g, " ");
}

function formatDetailValue(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Oui" : "Non";
    }

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}

function getDetailEntries(details) {
    if (details === null || details === undefined) {
        return [];
    }

    let normalized = details;

    if (typeof normalized === "string") {
        try {
            normalized = JSON.parse(normalized);
        } catch {
            return [["details", normalized]];
        }
    }

    if (Array.isArray(normalized)) {
        return normalized.map((value, index) => [
            String(index + 1),
            value,
        ]);
    }

    if (typeof normalized === "object") {
        return Object.entries(normalized);
    }

    return [["details", normalized]];
}

function DetailItem({ label, value, highlight = false }) {
    const isObject =
        value !== null && typeof value === "object";

    return (
        <div
            className={
                highlight
                    ? "platform-activity-detail-item platform-activity-detail-item--reason"
                    : "platform-activity-detail-item"
            }
        >
            <strong className="platform-activity-detail-label">
                {getDetailLabel(label)}
            </strong>

            {isObject ? (
                <pre>{formatDetailValue(value)}</pre>
            ) : (
                <span className="platform-activity-detail-value">
                    {formatDetailValue(value)}
                </span>
            )}
        </div>
    );
}

function ActivityDetailsModal({ activity, onClose }) {
    if (!activity) return null;

    const fullName = [
        activity.first_name,
        activity.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const detailEntries = getDetailEntries(activity.details);

    return (
        <div
            className="platform-activity-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="platform-activity-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="platform-activity-modal-title"
            >
                <header className="platform-activity-modal-header">
                    <div>
                        <p className="platform-activity-modal-eyebrow">
                            Journal d'audit
                        </p>

                        <h2
                            id="platform-activity-modal-title"
                            className="platform-activity-modal-title"
                        >
                            {getActionLabel(activity.action)}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="platform-activity-modal-close"
                        onClick={onClose}
                        aria-label="Fermer les détails"
                        autoFocus
                    >
                        ×
                    </button>
                </header>

                <div className="platform-activity-modal-body">
                    <section>
                        <h3 className="platform-activity-modal-section-title">
                            Informations générales
                        </h3>

                        <div className="platform-activity-modal-event">
                            <span className="platform-activity-event">
                                <span className="platform-activity-event-dot" />
                                {getActionLabel(activity.action)}
                            </span>
                        </div>

                        <div className="platform-activity-detail-grid">
                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Date et heure
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {formatDate(activity.created_at)}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Identifiant de l'événement
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {activity.id ?? "—"}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Administrateur ayant effectué l'action
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {fullName || "Compte indisponible"}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Adresse e-mail de l'administrateur
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {activity.email || "—"}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Identifiant de l'administrateur
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {activity.user_id ?? "—"}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Module
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {getModuleLabel(activity.module)}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Action enregistrée
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {activity.action || "—"}
                                </strong>
                            </div>

                            <div className="platform-activity-detail-card">
                                <span className="platform-activity-detail-label">
                                    Identifiant de l'entité concernée
                                </span>
                                <strong className="platform-activity-detail-value">
                                    {activity.entity_id ?? "—"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="platform-activity-modal-section-title">
                            Détails de l'opération
                        </h3>

                        {detailEntries.length > 0 ? (
                            <div className="platform-activity-detail-list">
                                {detailEntries.map(([key, value], index) => (
                                    <DetailItem
                                        key={`${key}-${index}`}
                                        label={key}
                                        value={value}
                                        highlight={key === "reason"}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="platform-activity-message">
                                Aucun détail supplémentaire n'est enregistré
                                pour cet événement.
                            </p>
                        )}
                    </section>
                </div>

                <footer className="platform-activity-modal-footer">
                    <button type="button" onClick={onClose}>
                        Fermer
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default function PlatformActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedActivity, setSelectedActivity] = useState(null);

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
                        err.message || "Une erreur est survenue."
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

    useEffect(() => {
        if (!selectedActivity) return;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setSelectedActivity(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedActivity]);

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
                                    Consultez chaque événement et ouvrez
                                    ses détails en cliquant sur sa ligne.
                                </p>
                            </div>

                            <span className="platform-activity-readonly">
                                Consultation
                            </span>
                        </div>

                        {loading && (
                            <p
                                className="platform-activity-message"
                                role="status"
                            >
                                Chargement des événements…
                            </p>
                        )}

                        {!loading && error && (
                            <div
                                className="platform-activity-error"
                                role="alert"
                            >
                                {error}

                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
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
                                                <tr
                                                    key={item.id}
                                                    tabIndex={0}
                                                    aria-label={`Consulter les détails : ${getActionLabel(item.action)}`}
                                                    onClick={() =>
                                                        setSelectedActivity(item)
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key === "Enter" ||
                                                            event.key === " "
                                                        ) {
                                                            event.preventDefault();
                                                            setSelectedActivity(item);
                                                        }
                                                    }}
                                                >
                                                    <td>
                                                        {formatDate(item.created_at)}
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
                                                            {getActionLabel(item.action)}
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
                                Cliquez sur une ligne pour consulter ses détails.
                            </p>
                        )}
                    </section>
                </main>
            </div>

            {selectedActivity && (
                <ActivityDetailsModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
}
