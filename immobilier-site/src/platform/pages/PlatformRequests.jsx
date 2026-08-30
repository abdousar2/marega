import { useEffect, useMemo, useState } from "react";

import PlatformSidebar
    from "../components/PlatformSidebar";

import PlatformHeader
    from "../components/PlatformHeader";

import "../styles/platform-requests.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export default function PlatformRequests() {

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const [selectedRequest, setSelectedRequest] =
    useState(null);

    const [showRequestDetails, setShowRequestDetails] =
    useState(false);

    const [showApproveModal, setShowApproveModal] =
        useState(false);

    const [approving, setApproving] =
        useState(false);

    const [approveError, setApproveError] =
        useState("");

    const [approveForm, setApproveForm] =
        useState({
            agency_name: "",
            agency_type: "Agence immobilière",
            agency_city: "Dakar",
            agency_country: "Sénégal",
            agency_address: "",
            agency_phone: "",
            agency_email: "",

            admin_first_name: "",
            admin_last_name: "",
            admin_email: "",
            admin_password: ""
        });

    const [showRejectModal, setShowRejectModal] =
        useState(false);

    const [rejecting, setRejecting] =
        useState(false);

    const [rejectError, setRejectError] =
        useState("");

    const [selectedRejectRequest, setSelectedRejectRequest] =
        useState(null);


    // =====================================================
    // CHARGEMENT DES DEMANDES
    // =====================================================

    async function loadRequests() {

        try {

            setLoading(true);

            setError("");


            const response =
                await fetch(
                    `${API_URL}/platform/requests`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de charger les demandes."
                );

            }


            setRequests(
                Array.isArray(data.requests)
                    ? data.requests
                    : []
            );

        }

        catch (err) {

            console.error(
                "PLATFORM REQUESTS ERROR:",
                err
            );

            setError(
                err.message ||
                "Impossible de charger les demandes."
            );

        }

        finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadRequests();

    }, []);


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const statistics =
        useMemo(() => {

            const total =
                requests.length;


            const newRequests =
                requests.filter(
                    request =>
                        request.status === "new"
                ).length;


            const approved =
                requests.filter(
                    request =>
                        request.status === "approved"
                ).length;


            const rejected =
                requests.filter(
                    request =>
                        request.status === "rejected"
                ).length;


            return {
                total,
                newRequests,
                approved,
                rejected
            };

        }, [requests]);


    // =====================================================
    // FILTRAGE
    // =====================================================

    const filteredRequests =
        useMemo(() => {

            const normalizedSearch =
                search
                    .trim()
                    .toLowerCase();


            return requests.filter(request => {

                // -----------------------------------------
                // FILTRE STATUT
                // -----------------------------------------

                if (
                    filter !== "all" &&
                    request.status !== filter
                ) {

                    return false;

                }


                // -----------------------------------------
                // RECHERCHE
                // -----------------------------------------

                if (!normalizedSearch) {

                    return true;

                }


                const searchableText = [

                    request.name,

                    request.email,

                    request.phone,

                    request.company,

                    request.city,

                    request.message

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    normalizedSearch
                );

            });

        }, [
            requests,
            search,
            filter
        ]);


    // =====================================================
    // FORMATAGE DATE
    // =====================================================

    function formatDate(value) {

        if (!value) {

            return "—";

        }


        const date =
            new Date(value);


        if (Number.isNaN(date.getTime())) {

            return "—";

        }


        return date.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // STATUT
    // =====================================================

    function getStatusLabel(status) {

        switch (status) {

            case "new":
                return "Nouvelle";

            case "approved":
                return "Approuvée";

            case "rejected":
                return "Refusée";

            default:
                return status || "Inconnu";

        }

    }


    function getStatusClass(status) {

        switch (status) {

            case "new":
                return "new";

            case "approved":
                return "approved";

            case "rejected":
                return "rejected";

            default:
                return "unknown";

        }

    }


    // =====================================================
    // INITIAL
    // =====================================================

    function getInitial(name) {

        return (
            name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() ||
            "D"
        );

    }

    function openApproveModal(request) {

        const nameParts =
            (request.name || "")
                .trim()
                .split(/\s+/);


        const firstName =
            nameParts[0] || "";


        const lastName =
            nameParts
                .slice(1)
                .join(" ");


        setSelectedRequest(request);

        setApproveError("");


        setApproveForm({

            agency_name:
                request.company ||
                "",

            agency_type:
                "Agence immobilière",

            agency_city:
                "Dakar",

            agency_country:
                "Sénégal",

            agency_address:
                "",

            agency_phone:
                request.phone ||
                "",

            agency_email:
                request.email ||
                "",

            admin_first_name:
                firstName,

            admin_last_name:
                lastName,

            admin_email:
                request.email ||
                "",

            admin_password:
                ""

        });


        setShowApproveModal(true);

    }

    function openRequestDetails(request) {

        setSelectedRequest(request);

        setShowRequestDetails(true);

    }    

    async function handleApprove() {

        if (!selectedRequest) {
            return;
        }


        try {

            setApproving(true);

            setApproveError("");


            const response =
                await fetch(
                    `${API_URL}/platform/requests/${selectedRequest.id}/approve`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(
                            approveForm
                        )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible d'approuver la demande."
                );

            }


            // Fermer la fenêtre
            setShowApproveModal(false);

            setSelectedRequest(null);


            // Recharger les demandes
            await loadRequests();


        }

        catch (err) {

            console.error(err);


            setApproveError(
                err.message ||
                "Impossible d'approuver la demande."
            );

        }

        finally {

            setApproving(false);

        }

    }

    function openRejectModal(request) {

        setSelectedRejectRequest(request);

        setRejectError("");

        setShowRejectModal(true);

    }

    async function handleReject() {

        if (!selectedRejectRequest) {
            return;
        }


        try {

            setRejecting(true);

            setRejectError("");


            const response =
                await fetch(
                    `${API_URL}/platform/requests/${selectedRejectRequest.id}/reject`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de refuser la demande."
                );

            }


            // =============================================
            // Fermer la modale
            // =============================================

            setShowRejectModal(false);

            setSelectedRejectRequest(null);


            // =============================================
            // Recharger les demandes
            // =============================================

            await loadRequests();

        }

        catch (err) {

            console.error(
                "PLATFORM REQUEST REJECT ERROR:",
                err
            );


            setRejectError(
                err.message ||
                "Impossible de refuser la demande."
            );

        }

        finally {

            setRejecting(false);

        }

    }


    return (

        <div className="platform-requests-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <PlatformSidebar />


            {/* =================================================
                CONTENU
            ================================================= */}

            <div className="platform-requests-main">

                <PlatformHeader />


                <main className="platform-requests-content">


                    {/* =================================================
                        EN-TÊTE
                    ================================================= */}

                    <div className="platform-requests-heading">

                        <div>

                            <p className="platform-requests-eyebrow">
                                ADMINISTRATION PLATEFORME
                            </p>

                            <h1>
                                Demandes
                            </h1>

                            <p className="platform-requests-subtitle">
                                Consultez et gérez les demandes
                                de souscription à TECHTRADISPORT
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        STATISTIQUES
                    ================================================= */}

                    <div className="platform-request-stats">


                        <div className="platform-request-stat-card">

                            <div className="platform-request-stat-icon total">
                                #
                            </div>

                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {statistics.total}
                                </strong>

                            </div>

                        </div>


                        <div className="platform-request-stat-card">

                            <div className="platform-request-stat-icon new">
                                !
                            </div>

                            <div>

                                <span>
                                    Nouvelles
                                </span>

                                <strong>
                                    {statistics.newRequests}
                                </strong>

                            </div>

                        </div>


                        <div className="platform-request-stat-card">

                            <div className="platform-request-stat-icon approved">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Approuvées
                                </span>

                                <strong>
                                    {statistics.approved}
                                </strong>

                            </div>

                        </div>


                        <div className="platform-request-stat-card">

                            <div className="platform-request-stat-icon rejected">
                                ×
                            </div>

                            <div>

                                <span>
                                    Refusées
                                </span>

                                <strong>
                                    {statistics.rejected}
                                </strong>

                            </div>

                        </div>


                    </div>


                    {/* =================================================
                        OUTILS
                    ================================================= */}

                    <div className="platform-requests-toolbar">


                        <div className="platform-request-search">

                            <span>
                                🔎
                            </span>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Rechercher une demande..."
                            />

                        </div>


                        <div className="platform-request-filters">

                            <button
                                type="button"
                                className={
                                    filter === "all"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter("all")
                                }
                            >
                                Toutes
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "new"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter("new")
                                }
                            >
                                Nouvelles
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "approved"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter("approved")
                                }
                            >
                                Approuvées
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "rejected"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter("rejected")
                                }
                            >
                                Refusées
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        ERREUR
                    ================================================= */}

                    {error && (

                        <div className="platform-requests-error">

                            <div className="platform-requests-error-icon">
                                !
                            </div>

                            <div>

                                <strong>
                                    Impossible de charger les demandes
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={loadRequests}
                            >
                                Réessayer
                            </button>

                        </div>

                    )}


                    {/* =================================================
                        CHARGEMENT
                    ================================================= */}

                    {loading && (

                        <div className="platform-requests-state">

                            <div className="platform-spinner" />

                            <p>
                                Chargement des demandes...
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        LISTE VIDE
                    ================================================= */}

                    {!loading &&
                        !error &&
                        filteredRequests.length === 0 && (

                            <div className="platform-requests-empty">

                                <div className="platform-requests-empty-icon">
                                    📋
                                </div>

                                <h2>
                                    Aucune demande
                                </h2>

                                <p>
                                    {search
                                        ? "Aucune demande ne correspond à votre recherche."
                                        : "Aucune demande ne correspond au filtre sélectionné."
                                    }
                                </p>

                            </div>

                        )}


                    {/* =================================================
                        DEMANDES
                    ================================================= */}

                    {!loading &&
                        !error &&
                        filteredRequests.length > 0 && (

                            <div className="platform-requests-list">

                                {filteredRequests.map(
                                    request => (

                                        <article
                                            key={request.id}
                                            className="platform-request-card"
                                        >


                                            {/* IDENTITÉ */}

                                            <div className="platform-request-card-top">

                                                <div className="platform-request-identity">

                                                    <div className="platform-request-avatar">

                                                        {getInitial(
                                                            request.name
                                                        )}

                                                    </div>


                                                    <div>

                                                        <h2>
                                                            {request.name}
                                                        </h2>

                                                        <p>
                                                            {request.company ||
                                                                "Entreprise non renseignée"
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                <div
                                                    className={
                                                        `platform-request-status ${getStatusClass(
                                                            request.status
                                                        )}`
                                                    }
                                                >

                                                    <span />

                                                    {getStatusLabel(
                                                        request.status
                                                    )}

                                                </div>

                                            </div>


                                            {/* INFORMATIONS */}

                                            <div className="platform-request-info-grid">


                                                <div>

                                                    <span>
                                                        Téléphone
                                                    </span>

                                                    <strong>
                                                        {request.phone || "—"}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Email
                                                    </span>

                                                    <strong>
                                                        {request.email || "—"}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Biens
                                                    </span>

                                                    <strong>
                                                        {request.buildings || "—"}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Locataires
                                                    </span>

                                                    <strong>
                                                        {request.tenants || "—"}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Reçue le
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            request.created_at
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* MESSAGE */}

                                            {request.message && (

                                                <div className="platform-request-message">

                                                    <span>
                                                        Message
                                                    </span>

                                                    <p>
                                                        {request.message}
                                                    </p>

                                                </div>

                                            )}


                                            {/* ACTIONS */}

                                            <div className="platform-request-actions">


                                                <button
                                                    type="button"
                                                    className="platform-request-details-button"
                                                    onClick={() =>
                                                        openRequestDetails(request)
                                                    }
                                                >
                                                    Voir les détails
                                                </button>


                                                {request.status === "new" && (

                                                    <>

                                                        <button
                                                            type="button"
                                                            className="platform-request-reject-button"
                                                            onClick={() =>
                                                                openRejectModal(request)
                                                            }
                                                        >
                                                            Refuser
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="platform-request-approve-button"
                                                            onClick={() =>
                                                                openApproveModal(request)
                                                            }
                                                        >
                                                            Approuver
                                                        </button>

                                                    </>

                                                )}

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        )}

                </main>

            </div>

            {showApproveModal && selectedRequest && (

                <div className="platform-approve-overlay">

                    <div className="platform-approve-modal">


                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="platform-approve-header">

                            <div>

                                <p>
                                    APPROBATION D'UNE DEMANDE
                                </p>

                                <h2>
                                    Créer l'agence
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowApproveModal(false)
                                }
                                className="platform-approve-close"
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================================
                            INTRODUCTION
                        ================================================= */}

                        <div className="platform-approve-intro">

                            <strong>
                                {selectedRequest.company ||
                                    selectedRequest.name
                                }
                            </strong>

                            <span>
                                La demande sera transformée en
                                agence active après validation.
                            </span>

                        </div>


                        {/* =================================================
                            ERREUR
                        ================================================= */}

                        {approveError && (

                            <div className="platform-approve-error">

                                {approveError}

                            </div>

                        )}


                        {/* =================================================
                            FORMULAIRE
                        ================================================= */}

                        <div className="platform-approve-form">


                            <div className="platform-approve-section-title">
                                Informations de l'agence
                            </div>


                            <div className="platform-approve-grid">

                                <div className="platform-approve-field">

                                    <label>
                                        Nom de l'agence *
                                    </label>

                                    <input
                                        value={
                                            approveForm.agency_name
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_name:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Type *
                                    </label>

                                    <input
                                        value={
                                            approveForm.agency_type
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_type:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Ville *
                                    </label>

                                    <input
                                        value={
                                            approveForm.agency_city
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_city:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Pays *
                                    </label>

                                    <input
                                        value={
                                            approveForm.agency_country
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_country:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field full">

                                    <label>
                                        Adresse
                                    </label>

                                    <input
                                        value={
                                            approveForm.agency_address
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_address:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Téléphone
                                    </label>

                                    <input
                                        value={
                                            approveForm.agency_phone
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_phone:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Email agence
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            approveForm.agency_email
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                agency_email:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>

                            </div>


                            <div className="platform-approve-section-title">
                                Administrateur principal
                            </div>


                            <div className="platform-approve-grid">

                                <div className="platform-approve-field">

                                    <label>
                                        Prénom *
                                    </label>

                                    <input
                                        value={
                                            approveForm.admin_first_name
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                admin_first_name:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Nom *
                                    </label>

                                    <input
                                        value={
                                            approveForm.admin_last_name
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                admin_last_name:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Email *
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            approveForm.admin_email
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                admin_email:
                                                    e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-approve-field">

                                    <label>
                                        Mot de passe initial *
                                    </label>

                                    <input
                                        type="password"
                                        value={
                                            approveForm.admin_password
                                        }
                                        onChange={(e) =>
                                            setApproveForm({
                                                ...approveForm,
                                                admin_password:
                                                    e.target.value
                                            })
                                        }
                                        placeholder="Minimum 8 caractères"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="platform-approve-actions">

                            <button
                                type="button"
                                className="platform-approve-cancel"
                                disabled={approving}
                                onClick={() =>
                                    setShowApproveModal(false)
                                }
                            >
                                Annuler
                            </button>


                            <button
                                type="button"
                                className="platform-approve-confirm"
                                disabled={approving}
                                onClick={handleApprove}
                            >

                                {approving
                                    ? "Création en cours..."
                                    : "Approuver et créer l'agence"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                MODALE DÉTAILS DEMANDE
            ================================================= */}

            {showRequestDetails && selectedRequest && (

                <div className="platform-modal-overlay">

                    <div className="platform-modal platform-request-details-modal">

                        {/* HEADER */}

                        <div className="platform-modal-header">

                            <div>

                                <p className="platform-modal-eyebrow">
                                    Demande de souscription
                                </p>

                                <h2>
                                    Détails de la demande
                                </h2>

                                <p>
                                    Consultez les informations complètes
                                    transmises par le demandeur.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="platform-modal-close"
                                onClick={() => {

                                    setShowRequestDetails(false);

                                    setSelectedRequest(null);

                                }}
                            >
                                ×
                            </button>

                        </div>

                    <div className="platform-request-details-content">


                        {/* IDENTITÉ */}

                        <div className="platform-request-details-identity">

                            <div className="platform-request-details-avatar">

                                {getInitial(
                                    selectedRequest.name
                                )}

                            </div>


                            <div>

                                <h3>
                                    {selectedRequest.name}
                                </h3>

                                <p>
                                    {selectedRequest.company ||
                                        "Entreprise non renseignée"
                                    }
                                </p>

                            </div>


                            <div
                                className={
                                    `platform-request-status ${getStatusClass(
                                        selectedRequest.status
                                    )}`
                                }
                            >

                                <span />

                                {getStatusLabel(
                                    selectedRequest.status
                                )}

                            </div>

                        </div>


                        {/* INFORMATIONS */}

                        <div className="platform-request-details-section">

                            <div className="platform-modal-section-title">
                                Informations de contact
                            </div>


                            <div className="platform-request-details-grid">

                                <div>

                                    <span>
                                        Nom
                                    </span>

                                    <strong>
                                        {selectedRequest.name || "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Société / agence
                                    </span>

                                    <strong>
                                        {selectedRequest.company || "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Téléphone
                                    </span>

                                    <strong>
                                        {selectedRequest.phone || "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {selectedRequest.email || "—"}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* INFORMATIONS ACTIVITÉ */}

                        <div className="platform-request-details-section">

                            <div className="platform-modal-section-title">
                                Activité immobilière
                            </div>


                            <div className="platform-request-details-grid">

                                <div>

                                    <span>
                                        Biens
                                    </span>

                                    <strong>
                                        {selectedRequest.buildings || "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Locataires
                                    </span>

                                    <strong>
                                        {selectedRequest.tenants || "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Date de réception
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedRequest.created_at
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Statut
                                    </span>

                                    <strong>
                                        {getStatusLabel(
                                            selectedRequest.status
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* MESSAGE */}

                        {selectedRequest.message && (

                            <div className="platform-request-details-section">

                                <div className="platform-modal-section-title">
                                    Message
                                </div>


                                <div className="platform-request-details-message">

                                    {selectedRequest.message}

                                </div>

                            </div>

                        )}

                    </div>


                        {/* ACTIONS */}

                        <div className="platform-modal-actions">

                            <button
                                type="button"
                                className="platform-modal-cancel"
                                onClick={() => {

                                    setShowRequestDetails(false);

                                    setSelectedRequest(null);

                                }}
                            >
                                Fermer
                            </button>


                            {selectedRequest.status === "new" && (

                                <button
                                    type="button"
                                    className="platform-modal-submit"
                                    onClick={() => {

                                        setShowRequestDetails(false);

                                        openApproveModal(
                                            selectedRequest
                                        );

                                    }}
                                >
                                    Approuver la demande
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

            {showRejectModal && selectedRejectRequest && (

                <div className="platform-reject-overlay">

                    <div className="platform-reject-modal">


                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="platform-reject-header">

                            <div>

                                <p>
                                    REFUS DE LA DEMANDE
                                </p>

                                <h2>
                                    Refuser cette demande ?
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="platform-reject-close"
                                disabled={rejecting}
                                onClick={() => {

                                    setShowRejectModal(false);

                                    setSelectedRejectRequest(null);

                                    setRejectError("");

                                }}
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================================
                            CONTENU
                        ================================================= */}

                        <div className="platform-reject-content">


                            <div className="platform-reject-icon">
                                !
                            </div>


                            <div className="platform-reject-message">

                                <strong>
                                    {selectedRejectRequest.company ||
                                        selectedRejectRequest.name
                                    }
                                </strong>

                                <p>
                                    Vous êtes sur le point de refuser
                                    cette demande de souscription.
                                </p>

                                <span>
                                    Cette action modifiera le statut
                                    de la demande en « Refusée ».
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            ERREUR
                        ================================================= */}

                        {rejectError && (

                            <div className="platform-reject-error">

                                <span>
                                    !
                                </span>

                                <p>
                                    {rejectError}
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="platform-reject-actions">

                            <button
                                type="button"
                                className="platform-reject-cancel"
                                disabled={rejecting}
                                onClick={() => {

                                    setShowRejectModal(false);

                                    setSelectedRejectRequest(null);

                                    setRejectError("");

                                }}
                            >
                                Annuler
                            </button>


                            <button
                                type="button"
                                className="platform-reject-confirm"
                                disabled={rejecting}
                                onClick={handleReject}
                            >

                                {rejecting
                                    ? "Refus en cours..."
                                    : "Refuser la demande"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}