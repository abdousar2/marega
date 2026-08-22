import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Connexion.css";



export default function Connexion() {

    const navigate = useNavigate();

    const [agencies, setAgencies] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

   useEffect(() => {

    console.log("CONNEXION : chargement des agences");

    fetch("http://localhost:5000/api/agencies")
        .then((response) => {

            if (!response.ok) {
                throw new Error(
                    "Erreur API agences"
                );
            }

            return response.json();

        })
        .then((data) => {

            console.log(
                "CONNEXION : agences reçues",
                data
            );

            setAgencies(data);

        })
        .catch((err) => {

            console.error(
                "CONNEXION : erreur",
                err
            );

            setError(
                "Impossible de charger les agences."
            );

        })
        .finally(() => {

            setLoading(false);

        });

}, []);


    /* =========================================================
       ÉTAT DES FILTRES
    ========================================================= */

    const [search, setSearch] = useState("");

    const [cityFilter, setCityFilter] = useState("all");

    const [typeFilter, setTypeFilter] = useState("all");


    /* =========================================================
       LISTE DES VILLES
    ========================================================= */

    const cities = useMemo(() => {

        return [
            ...new Set(
                agencies.map((agency) => agency.city)
            )
        ].sort();

    }, [agencies]);


    /* =========================================================
       LISTE DES TYPES
    ========================================================= */

    const types = useMemo(() => {

        return [
            ...new Set(
                agencies.map((agency) => agency.type)
            )
        ].sort();

    }, []);


    /* =========================================================
       FILTRAGE
    ========================================================= */

    const filteredAgencies = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();


        return agencies.filter((agency) => {

            const matchesSearch =
                searchValue === "" ||

                agency.name
                    ?.toLowerCase()
                    .includes(searchValue) ||

                agency.city
                    ?.toLowerCase()
                    .includes(searchValue) ||

                agency.country
                    ?.toLowerCase()
                    .includes(searchValue) ||

                agency.type
                    ?.toLowerCase()
                    .includes(searchValue);


            const matchesCity =
                cityFilter === "all" ||
                agency.city === cityFilter;


            const matchesType =
                typeFilter === "all" ||
                agency.type === typeFilter;


            return (
                matchesSearch &&
                matchesCity &&
                matchesType
            );

        });

    }, [
        agencies,
        search,
        cityFilter,
        typeFilter
    ]);


    /* =========================================================
       RÉINITIALISER
    ========================================================= */

    const resetFilters = () => {

        setSearch("");

        setCityFilter("all");

        setTypeFilter("all");

    };


    /* =========================================================
       SÉLECTION AGENCE
    ========================================================= */

    const handleAgencySelect = (agency) => {

        sessionStorage.setItem(
            "techtradisport_selected_agency",
            JSON.stringify(agency)
        );

        navigate("/login");

    };


    return (

        <div className="connexion-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="connexion-header">

                <NavLink
                    to="/"
                    className="connexion-logo"
                >

                    <span className="connexion-logo-name">
                        TECHTRADISPORT
                    </span>

                    <span className="connexion-logo-subtitle">
                        SOLUTIONS IMMOBILIÈRES
                    </span>

                </NavLink>


                <NavLink
                    to="/"
                    className="connexion-back"
                >
                    ← Retour au site
                </NavLink>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="connexion-main">

                <div className="connexion-content">


                    {/* =================================================
                        INTRODUCTION
                    ================================================= */}

                    <div className="connexion-intro">

                        <span className="connexion-eyebrow">
                            ESPACE PROFESSIONNEL
                        </span>

                        <h1>
                            Accédez à votre
                            <span> espace de gestion.</span>
                        </h1>

                        <p>
                            Sélectionnez votre agence pour accéder
                            à votre espace TECHTRADISPORT.
                        </p>

                    </div>


                    {/* =================================================
                        AGENCES
                    ================================================= */}

                    <div className="agency-section">


                        {/* =============================================
                            EN-TÊTE
                        ============================================= */}

                        <div className="agency-section-header">

                            <div>

                                <h2>
                                    Choisissez votre agence
                                </h2>

                                <p>
                                    Recherchez votre agence ou utilisez
                                    les filtres pour la retrouver.
                                </p>

                            </div>


                            <span className="agency-count">

                                {filteredAgencies.length}

                                {" "}

                                agence
                                {filteredAgencies.length > 1 ? "s" : ""}

                            </span>

                        </div>


                        {/* =================================================
                            RECHERCHE + FILTRES
                        ================================================= */}

                        <div className="agency-filters">


                            {/* RECHERCHE */}

                            <div className="agency-search">

                                <span className="agency-search-icon">
                                    🔎
                                </span>

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Rechercher une agence..."
                                    aria-label="Rechercher une agence"
                                />

                                {search && (

                                    <button
                                        type="button"
                                        className="agency-search-clear"
                                        onClick={() => setSearch("")}
                                        aria-label="Effacer la recherche"
                                    >
                                        ×
                                    </button>

                                )}

                            </div>


                            {/* FILTRE VILLE */}

                            <select
                                value={cityFilter}
                                onChange={(event) =>
                                    setCityFilter(event.target.value)
                                }
                                className="agency-filter-select"
                                aria-label="Filtrer par ville"
                            >

                                <option value="all">
                                    Toutes les villes
                                </option>

                                {cities.map((city) => (

                                    <option
                                        key={city}
                                        value={city}
                                    >
                                        {city}
                                    </option>

                                ))}

                            </select>


                            {/* FILTRE TYPE */}

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                className="agency-filter-select"
                                aria-label="Filtrer par type"
                            >

                                <option value="all">
                                    Tous les types
                                </option>

                                {types.map((type) => (

                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>

                                ))}

                            </select>


                            {/* RESET */}

                            {(search ||
                                cityFilter !== "all" ||
                                typeFilter !== "all") && (

                                <button
                                    type="button"
                                    className="agency-reset"
                                    onClick={resetFilters}
                                >
                                    Réinitialiser
                                </button>

                            )}

                        </div>


                        {/* =================================================
                            RESULTATS
                        ================================================= */}

                        
                        {loading ? (

                            <div className="agency-empty">

                                <div className="agency-empty-icon">
                                    ⏳
                                </div>

                                <h3>
                                    Chargement des agences
                                </h3>

                                <p>
                                    Nous récupérons les agences disponibles.
                                </p>

                            </div>

                        ) : error ? (

                            <div className="agency-empty">

                                <div className="agency-empty-icon">
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
                                    onClick={() => window.location.reload()}
                                >
                                    Réessayer
                                </button>

                            </div>

                        ) : filteredAgencies.length > 0 ? (

                            <div className="agency-grid">

                                {filteredAgencies.map((agency) => (

                                    <button
                                        type="button"
                                        key={agency.id}
                                        className="agency-card"
                                        onClick={() =>
                                            handleAgencySelect(agency)
                                        }
                                    >


                                        {/* HAUT */}

                                        <div className="agency-card-top">

                                            <div className="agency-icon">
                                                🏢
                                            </div>

                                            <span className="agency-arrow">
                                                →
                                            </span>

                                        </div>


                                        {/* CONTENU */}

                                        <div className="agency-card-content">

                                            <span className="agency-status">

                                                <span />

                                                {agency.status === "active"
                                                    ? "Plateforme en exploitation"
                                                    : "Agence inactive"
                                                }

                                            </span>


                                            <h3>
                                                {agency.name}
                                            </h3>


                                            <p>
                                                {agency.type}
                                            </p>


                                            <span className="agency-location">
                                                📍 {agency.city}, {agency.country}
                                            </span>

                                        </div>


                                        {/* FOOTER */}

                                        <div className="agency-card-footer">

                                            <span>
                                                Accéder à l'agence
                                            </span>

                                            <strong>
                                                →
                                            </strong>

                                        </div>

                                    </button>

                                ))}

                            </div>

                            

                        ) : (

                            /* =================================================
                               AUCUN RÉSULTAT
                            ================================================= */

                            <div className="agency-empty">

                                <div className="agency-empty-icon">
                                    🔎
                                </div>

                                <h3>
                                    Aucune agence trouvée
                                </h3>

                                <p>
                                    Aucune agence ne correspond à votre
                                    recherche ou aux filtres sélectionnés.
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                >
                                    Réinitialiser les filtres
                                </button>

                            </div>

                        )}


                        {/* =================================================
                            AIDE
                        ================================================= */}

                        <div className="agency-help">

                            <div className="agency-help-icon">
                                ?
                            </div>

                            <div>

                                <strong>
                                    Vous ne trouvez pas votre agence ?
                                </strong>

                                <p>
                                    Contactez l'administrateur de votre
                                    agence ou notre équipe.
                                </p>

                            </div>


                            <NavLink
                                to="/contact"
                                className="agency-help-link"
                            >
                                Nous contacter
                            </NavLink>

                        </div>

                    </div>

                </div>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="connexion-footer">

                <span>
                    © 2026 TECHTRADISPORT
                </span>

                <span>
                    Plateforme de gestion immobilière
                </span>

            </footer>

        </div>

    );

}