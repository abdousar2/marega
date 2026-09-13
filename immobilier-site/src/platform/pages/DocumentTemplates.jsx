import { useEffect, useState } from "react";

import PlatformSidebar
    from "../components/PlatformSidebar";

import PlatformHeader
    from "../components/PlatformHeader";

import PlatformAuthService
    from "../../services/platformAuth.service";

import "../styles/DocumentTemplates.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const API_ORIGIN =
    API_URL.replace(/\/api\/?$/, "");

export default function DocumentTemplates() {

    const [agencies, setAgencies] =
        useState([]);

    const [agencyId, setAgencyId] =
        useState("");

    const [file, setFile] =
        useState(null);

    const [templateName, setTemplateName] =
        useState("");

    const [leases, setLeases] =
        useState([]);

    const [leaseId, setLeaseId] =
        useState("");

    const [loadingLeases, setLoadingLeases] =
        useState(false);

    const [loadingAgencies, setLoadingAgencies] =
        useState(true);

    const [processing, setProcessing] =
        useState(false);

    const [generating, setGenerating] =
        useState(false);

    const [template, setTemplate] =
        useState(null);

    const [pdf, setPdf] =
        useState(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // CHARGER LES AGENCES
    // =====================================================

    useEffect(() => {

        loadAgencies();

    }, []);

    useEffect(() => {

        if (!agencyId) {

            setLeases([]);
            setLeaseId("");

            return;
        }

        loadLeases(
            agencyId
        );

    }, [agencyId]);


    async function loadAgencies() {

        setLoadingAgencies(true);
        setError("");

        try {

            const token =
                PlatformAuthService.getToken();

            const response =
                await fetch(
                    `${API_URL}/platform/agencies`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Impossible de charger les agences."
                );
            }

            const list =
                data.agencies ||
                data.result ||
                data.data ||
                data ||
                [];

            setAgencies(
                Array.isArray(list)
                    ? list
                    : []
            );

        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoadingAgencies(false);
        }
    }

    // =====================================================
    // CHARGER LES BAUX DE L'AGENCE
    // =====================================================

    async function loadLeases(
        selectedAgencyId
    ) {

        setLoadingLeases(true);
        setLeases([]);
        setLeaseId("");
        setError("");

        try {

            const token =
                PlatformAuthService.getToken();


            const response =
                await fetch(
                    `${API_URL}/platform/agencies/${selectedAgencyId}/leases`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Impossible de charger les baux."
                );
            }


            setLeases(
                Array.isArray(
                    data.leases
                )
                    ? data.leases
                    : []
            );

        }

        catch (err) {

            setError(
                err.message
            );

        }

        finally {

            setLoadingLeases(false);
        }
    }


    // =====================================================
    // ANALYSER LE DOCUMENT
    // =====================================================

    async function handleProcess(
        event
    ) {

        event.preventDefault();

        setError("");
        setSuccess("");
        setTemplate(null);
        setPdf(null);

        if (!agencyId) {

            setError(
                "Sélectionne une agence."
            );

            return;
        }

        if (!file) {

            setError(
                "Sélectionne un contrat PDF."
            );

            return;
        }


        setProcessing(true);

        try {

            const token =
                PlatformAuthService.getToken();

            const formData =
                new FormData();

            formData.append(
                "document",
                file
            );

            formData.append(
                "agency_id",
                agencyId
            );

            if (templateName.trim()) {

                formData.append(
                    "name",
                    templateName.trim()
                );
            }


            const response =
                await fetch(
                    `${API_URL}/platform/document-templates/process`,
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },
                        body: formData
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Erreur lors de l'analyse."
                );
            }


            const saved =
                data.saved ||
                data.result ||
                {};


            const createdTemplate =
                saved.template ||
                saved;


            setTemplate(
                createdTemplate
            );

            setSuccess(
                "Le contrat a été analysé et le template IA a été créé avec succès."
            );

        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setProcessing(false);
        }
    }


    // =====================================================
    // GÉNÉRER LE CONTRAT
    // =====================================================

    async function handleGeneratePDF(
        event
    ) {

        event.preventDefault();

        setError("");
        setSuccess("");
        setPdf(null);


        if (!template?.id) {

            setError(
                "Aucun template disponible."
            );

            return;
        }


        if (!leaseId) {

            setError(
                "Sélectionne un bail."
            );

            return;
        }


        setGenerating(true);

        try {

            const token =
                PlatformAuthService.getToken();


            const response =
                await fetch(
                    `${API_URL}/platform/document-templates/render-lease-pdf`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            templateId:
                                Number(
                                    template.id
                                ),

                            leaseId:
                                Number(
                                    leaseId
                                ),

                            agency_id:
                                Number(
                                    agencyId
                                )
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Erreur lors de la génération du PDF."
                );
            }


            setPdf(
                data.pdf
            );

            setSuccess(
                "Le contrat PDF a été généré avec succès."
            );

        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setGenerating(false);
        }
    }


    function getAgencyName(
        agency
    ) {

        return (
            agency.name ||
            agency.company_name ||
            `Agence ${agency.id}`
        );
    }


    function getPdfUrl() {

        if (!pdf?.path) {
            return null;
        }

        if (
            pdf.path.startsWith(
                "http://"
            ) ||
            pdf.path.startsWith(
                "https://"
            )
        ) {

            return pdf.path;
        }

        return (
            `${API_ORIGIN}${pdf.path}`
        );
    }


    return (

        <div className="document-templates-layout">

            <PlatformSidebar />

            <div className="document-templates-main">

                <PlatformHeader />

                <main className="document-templates-content">

                    <div className="document-templates-page">

                        <div className="document-templates-shell">

                            {/* =================================================
                                EN-TÊTE
                            ================================================= */}

                            <header className="document-templates-header">

                                <div>

                                    <span className="document-templates-eyebrow">
                                        INTELLIGENCE DOCUMENTAIRE
                                    </span>

                                    <h1>
                                        Modèles de documents
                                    </h1>

                                    <p>
                                        Transforme automatiquement le contrat
                                        d'une agence en modèle réutilisable
                                        pour les futurs baux.
                                    </p>

                                </div>

                                <div className="document-templates-badge">
                                    IA
                                </div>

                            </header>


                            {/* =================================================
                                ERREUR
                            ================================================= */}

                            {error && (

                                <div className="document-templates-alert error">

                                    <strong>
                                        Erreur
                                    </strong>

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            )}


                            {/* =================================================
                                SUCCÈS
                            ================================================= */}

                            {success && (

                                <div className="document-templates-alert success">

                                    <strong>
                                        ✓
                                    </strong>

                                    <span>
                                        {success}
                                    </span>

                                </div>

                            )}


                            {/* =================================================
                                CONTENU
                            ================================================= */}

                            <div className="document-templates-grid">


                                {/* =================================================
                                    ÉTAPE 1
                                ================================================= */}

                                <section className="document-card">

                                    <div className="document-card-step">
                                        01
                                    </div>

                                    <div className="document-card-header">

                                        <div>

                                            <h2>
                                                Créer un modèle
                                            </h2>

                                            <p>
                                                Dépose le contrat utilisé
                                                par l'agence.
                                            </p>

                                        </div>

                                    </div>


                                    <form
                                        onSubmit={
                                            handleProcess
                                        }
                                        className="document-form"
                                    >

                                        <label>
                                            Agence cible
                                        </label>

                                        <select
                                            value={agencyId}
                                            onChange={(event) =>
                                                setAgencyId(
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                loadingAgencies ||
                                                processing
                                            }
                                        >

                                            <option value="">
                                                {loadingAgencies
                                                    ? "Chargement..."
                                                    : "Sélectionner une agence"
                                                }
                                            </option>

                                            {agencies.map(
                                                (agency) => (

                                                    <option
                                                        key={
                                                            agency.id
                                                        }
                                                        value={
                                                            agency.id
                                                        }
                                                    >
                                                        {
                                                            getAgencyName(
                                                                agency
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <label>
                                            Nom du modèle
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                templateName
                                            }
                                            onChange={(event) =>
                                                setTemplateName(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ex. Contrat de location standard"
                                        />


                                        <label>
                                            Contrat de référence
                                        </label>

                                        <label className="document-dropzone">

                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(event) =>
                                                    setFile(
                                                        event.target.files?.[0] ||
                                                        null
                                                    )
                                                }
                                                disabled={
                                                    processing
                                                }
                                            />

                                            <span className="document-dropzone-icon">
                                                ↑
                                            </span>

                                            <strong>
                                                {file
                                                    ? file.name
                                                    : "Déposer un fichier PDF"
                                                }
                                            </strong>

                                            <small>
                                                Contrat utilisé comme référence
                                                par l'agence
                                            </small>

                                        </label>


                                        <button
                                            type="submit"
                                            className="document-primary-button"
                                            disabled={
                                                processing
                                            }
                                        >

                                            {processing ? (
                                                <>
                                                    <span className="document-spinner" />
                                                    Analyse en cours...
                                                </>
                                            ) : (
                                                <>
                                                    ✦
                                                    Analyser et créer le modèle
                                                </>
                                            )}

                                        </button>

                                    </form>

                                </section>


                                {/* =================================================
                                    ÉTAPE 2
                                ================================================= */}

                                <section
                                    className={
                                        `document-card ${
                                            template
                                                ? "document-card-active"
                                                : ""
                                        }`
                                    }
                                >

                                    <div className="document-card-step">
                                        02
                                    </div>

                                    <div className="document-card-header">

                                        <div>

                                            <h2>
                                                Modèle généré
                                            </h2>

                                            <p>
                                                Le système transforme le document
                                                en variables et clauses réutilisables.
                                            </p>

                                        </div>

                                    </div>


                                    {!template ? (

                                        <div className="document-empty">

                                            <div className="document-empty-icon">
                                                ✦
                                            </div>

                                            <strong>
                                                Aucun modèle généré
                                            </strong>

                                            <span>
                                                Dépose un contrat pour commencer.
                                            </span>

                                        </div>

                                    ) : (

                                        <div className="document-result">

                                            <div className="document-result-main">

                                                <span>
                                                    TEMPLATE
                                                </span>

                                                <strong>
                                                    {
                                                        template.name ||
                                                        "Template automatique"
                                                    }
                                                </strong>

                                            </div>


                                            <div className="document-result-grid">

                                                <div>
                                                    <span>
                                                        Identifiant
                                                    </span>

                                                    <strong>
                                                        #{template.id}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Version
                                                    </span>

                                                    <strong>
                                                        v{
                                                            template.version ||
                                                            1
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Type
                                                    </span>

                                                    <strong>
                                                        {
                                                            template.document_type ||
                                                            "LEASE_CONTRACT"
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Statut
                                                    </span>

                                                    <strong className="document-status">
                                                        {
                                                            template.status ||
                                                            "DRAFT"
                                                        }
                                                    </strong>
                                                </div>

                                            </div>


                                            <div className="document-template-ready">

                                                <span>
                                                    ✓
                                                </span>

                                                <div>

                                                    <strong>
                                                        Modèle prêt
                                                    </strong>

                                                    <p>
                                                        Le modèle peut maintenant
                                                        servir à produire des contrats.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </section>


                                {/* =================================================
                                    ÉTAPE 3
                                ================================================= */}

                                <section
                                    className={
                                        `document-card document-card-full ${
                                            template
                                                ? ""
                                                : "document-card-disabled"
                                        }`
                                    }
                                >

                                    <div className="document-card-step">
                                        03
                                    </div>

                                    <div className="document-card-header">

                                        <div>

                                            <h2>
                                                Générer un contrat
                                            </h2>

                                            <p>
                                                Utilise le modèle avec un bail
                                                existant de l'agence.
                                            </p>

                                        </div>

                                    </div>


                                    <form
                                        onSubmit={
                                            handleGeneratePDF
                                        }
                                        className="document-generate-form"
                                    >

                                        <div>

                                            <label>
                                                Bail à générer
                                            </label>

                                            <select
                                                value={leaseId}
                                                onChange={(event) =>
                                                    setLeaseId(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    !template ||
                                                    generating ||
                                                    loadingLeases ||
                                                    !agencyId
                                                }
                                            >

                                                <option value="">
                                                    {loadingLeases
                                                        ? "Chargement des baux..."
                                                        : leases.length === 0
                                                            ? "Aucun bail disponible"
                                                            : "Sélectionner un bail"
                                                    }
                                                </option>

                                                {leases.map(
                                                    (lease) => (

                                                        <option
                                                            key={lease.id}
                                                            value={lease.id}
                                                        >

                                                            {lease.contract_number}
                                                            {" — "}
                                                            {lease.tenant_name ||
                                                                "Locataire non renseigné"
                                                            }
                                                            {" — "}
                                                            {lease.apartment_number ||
                                                                "Logement non renseigné"
                                                            }
                                                            {lease.building_name
                                                                ? ` — ${lease.building_name}`
                                                                : ""
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <button
                                            type="submit"
                                            className="document-primary-button"
                                            disabled={
                                                !template ||
                                                generating
                                            }
                                        >

                                            {generating ? (
                                                <>
                                                    <span className="document-spinner" />
                                                    Génération...
                                                </>
                                            ) : (
                                                <>
                                                    PDF
                                                    Générer le contrat
                                                </>
                                            )}

                                        </button>

                                    </form>


                                    {pdf && (

                                        <div className="document-pdf-result">

                                            <div>

                                                <span className="document-pdf-icon">
                                                    PDF
                                                </span>

                                                <div>

                                                    <strong>
                                                        {pdf.filename}
                                                    </strong>

                                                    <small>
                                                        Contrat généré avec succès
                                                    </small>

                                                </div>

                                            </div>


                                            <a
                                                href={
                                                    getPdfUrl()
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="document-download-button"
                                            >
                                                Ouvrir le PDF
                                            </a>

                                        </div>

                                    )}

                                </section>


                            </div>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );

}