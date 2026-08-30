import { useEffect, useState } from "react";

import PlatformSidebar
    from "../components/PlatformSidebar";

import PlatformHeader
    from "../components/PlatformHeader";

import "../styles/platform-agencies.css";

import { useNavigate } from "react-router-dom";

import { NavLink } from "react-router-dom";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export default function PlatformAgencies() {

    const [agencies, setAgencies] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const navigate = useNavigate();


    /* =========================================================
       CHARGEMENT DES AGENCES
    ========================================================= */

    useEffect(() => {

        loadAgencies();

    }, []);


    async function loadAgencies() {

        try {

            setLoading(true);

            setError("");

            /*
             * Pour l'instant on utilise le token
             * de l'administration plateforme.
             *
             * Si ton PlatformAuthService expose
             * getToken(), nous l'utiliserons ensuite
             * directement.
             */

            const token =
                localStorage.getItem(
                    "techtradisport_platform_token"
                );


            const response = await fetch(
                `${API_URL}/platform/agencies`,
                {
                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                            }
                            : {})
                    }
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Impossible de charger les agences."
                );

            }


            setAgencies(
                Array.isArray(result)
                    ? result
                    : result.agencies || []
            );

        }

        catch (err) {

            console.error(
                "Erreur chargement agences :",
                err
            );

            setError(
                err.message ||
                "Impossible de charger les agences."
            );

        }

        finally {

            setLoading(false);

        }

    }


    /* =========================================================
       FILTRAGE
    ========================================================= */

    const filteredAgencies =
        agencies.filter((agency) => {

            const searchValue =
                search.toLowerCase().trim();


            const matchesSearch =
                !searchValue ||
                agency.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                agency.city
                    ?.toLowerCase()
                    .includes(searchValue) ||
                agency.email
                    ?.toLowerCase()
                    .includes(searchValue);


            const matchesStatus =
                statusFilter === "all" ||
                agency.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    /* =========================================================
       STATISTIQUES
    ========================================================= */

    const totalAgencies =
        agencies.length;


    const activeAgencies =
        agencies.filter(
            agency =>
                agency.status === "active"
        ).length;


    const inactiveAgencies =
        agencies.filter(
            agency =>
                agency.status !== "active"
        ).length;


    return (

        <div className="platform-agencies">

            <PlatformSidebar />


            <div className="platform-agencies-main">

                <PlatformHeader />


                <main className="platform-agencies-content">


                    {/* =================================================
                        EN-TÊTE
                    ================================================= */}

                    <section className="platform-agencies-heading">

                        <div>

                            <p className="platform-agencies-eyebrow">
                                Administration plateforme
                            </p>

                            <h2>
                                Agences
                            </h2>

                            <p className="platform-agencies-subtitle">
                                Gérez les agences utilisant
                                la plateforme MAREGA.
                            </p>

                        </div>


                        <button
    type="button"
    className="platform-agencies-new-button"
    onClick={() =>
        navigate("/platform/agencies/new")
    }
>
    + Nouvelle agence
</button>

                    </section>


                    {/* =================================================
                        STATISTIQUES
                    ================================================= */}

                    <section className="platform-agencies-stats">


                        <div className="platform-agencies-stat-card">

                            <div className="platform-agencies-stat-icon">
                                🏢
                            </div>

                            <div>

                                <p>
                                    Total
                                </p>

                                <strong>
                                    {totalAgencies}
                                </strong>

                            </div>

                        </div>


                        <div className="platform-agencies-stat-card">

                            <div className="platform-agencies-stat-icon active">
                                ✓
                            </div>

                            <div>

                                <p>
                                    Actives
                                </p>

                                <strong>
                                    {activeAgencies}
                                </strong>

                            </div>

                        </div>


                        <div className="platform-agencies-stat-card">

                            <div className="platform-agencies-stat-icon inactive">
                                —
                            </div>

                            <div>

                                <p>
                                    Inactives
                                </p>

                                <strong>
                                    {inactiveAgencies}
                                </strong>

                            </div>

                        </div>


                    </section>


                    {/* =================================================
                        FILTRES
                    ================================================= */}

                    <section className="platform-agencies-toolbar">


                        <div className="platform-agencies-search">

                            <span>
                                🔎
                            </span>

                            <input
                                type="text"
                                placeholder="Rechercher une agence..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="platform-agencies-filters">

                            <button
                                type="button"
                                className={
                                    statusFilter === "all"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter("all")
                                }
                            >
                                Toutes
                            </button>


                            <button
                                type="button"
                                className={
                                    statusFilter === "active"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter("active")
                                }
                            >
                                Actives
                            </button>


                            <button
                                type="button"
                                className={
                                    statusFilter === "inactive"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setStatusFilter("inactive")
                                }
                            >
                                Inactives
                            </button>

                        </div>

                    </section>


                    {/* =================================================
                        CONTENU
                    ================================================= */}

                    <section className="platform-agencies-list">


                        {loading && (

                            <div className="platform-agencies-state">

                                <div className="platform-agencies-spinner" />

                                <p>
                                    Chargement des agences...
                                </p>

                            </div>

                        )}


                        {!loading && error && (

                            <div className="platform-agencies-state error">

                                <div className="platform-agencies-state-icon">
                                    !
                                </div>

                                <h3>
                                    Impossible de charger les agences
                                </h3>

                                <p>
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={loadAgencies}
                                >
                                    Réessayer
                                </button>

                            </div>

                        )}


                        {!loading &&
                        !error &&
                        filteredAgencies.length === 0 && (

                            <div className="platform-agencies-state">

                                <div className="platform-agencies-state-icon">
                                    🔎
                                </div>

                                <h3>
                                    Aucune agence trouvée
                                </h3>

                                <p>
                                    Aucune agence ne correspond
                                    à votre recherche.
                                </p>

                            </div>

                        )}


                        {!loading &&
                        !error &&
                        filteredAgencies.length > 0 && (

                            <div className="platform-agencies-grid">

                                {filteredAgencies.map(
                                    (agency) => (

                                        <article
                                            key={agency.id}
                                            className="platform-agency-card"
                                        >

                                            {/* En-tête carte */}

                                            <div className="platform-agency-card-header">

                                                <div className="platform-agency-logo">

                                                    {agency.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                    }

                                                </div>


                                                <div className="platform-agency-status">

                                                    <span
                                                        className={
                                                            agency.status === "active"
                                                                ? "active"
                                                                : "inactive"
                                                        }
                                                    />

                                                    {agency.status === "active"
                                                        ? "Active"
                                                        : "Inactive"
                                                    }

                                                </div>

                                            </div>


                                            {/* Informations */}

                                            <div className="platform-agency-card-body">

                                                <h3>
                                                    {agency.name}
                                                </h3>

                                                <p className="platform-agency-type">
                                                    {agency.type}
                                                </p>


                                                <div className="platform-agency-info">

                                                    <div>

                                                        <span>
                                                            Ville
                                                        </span>

                                                        <strong>
                                                            {agency.city || "—"}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Pays
                                                        </span>

                                                        <strong>
                                                            {agency.country || "—"}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Email
                                                        </span>

                                                        <strong>
                                                            {agency.email || "—"}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Téléphone
                                                        </span>

                                                        <strong>
                                                            {agency.phone || "—"}
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* Actions */}

                                            <div className="platform-agency-card-footer">

                                                <NavLink
                                                    to={`/platform/agencies/${agency.id}`}
                                                    className="platform-agency-card-link"
                                                >
                                                    Voir les détails
                                                </NavLink>

                                                <button
                                                    type="button"
                                                    className="secondary"
                                                >
                                                    Modifier
                                                </button>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </main>

            </div>

        </div>

    );

}