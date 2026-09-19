import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./AgencySettings.css";
import Layout from "../Layout";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const EMPTY_FORM = {
    name: "",
    type: "",
    city: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    ninea: "",
    rccm: ""
};


export default function AgencySettings() {

    const navigate = useNavigate();

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [success, setSuccess] =
        useState("");

    const [error, setError] =
        useState("");


    // =====================================================
    // CHARGEMENT
    // =====================================================

    useEffect(() => {

        const loadAgency = async () => {

            try {

                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem("marega_token");


                if (!token) {

                    navigate(
                        "/login",
                        { replace: true }
                    );

                    return;

                }


                const response =
                    await fetch(
                        `${API_URL}/agencies/me`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.status === 401
                ) {

                    localStorage.removeItem(
                        "marega_token"
                    );

                    navigate(
                        "/login",
                        { replace: true }
                    );

                    return;

                }


                if (
                    !response.ok
                ) {

                    throw new Error(
                        data.error ||
                        "Impossible de charger les informations de l'agence."
                    );

                }


                setForm({
                    name:
                        data.name || "",

                    type:
                        data.type || "",

                    city:
                        data.city || "",

                    country:
                        data.country || "",

                    address:
                        data.address || "",

                    phone:
                        data.phone || "",

                    email:
                        data.email || "",

                    ninea:
                        data.ninea || "",

                    rccm:
                        data.rccm || ""
                });


            }
            catch (err) {

                console.error(
                    "Erreur chargement paramètres agence :",
                    err
                );

                setError(
                    err.message ||
                    "Impossible de charger les paramètres."
                );

            }
            finally {

                setLoading(false);

            }

        };


        loadAgency();

    }, [navigate]);


    // =====================================================
    // CHANGEMENT
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm(
            previous => ({
                ...previous,
                [name]: value
            })
        );


        setSuccess("");
        setError("");

    };


    // =====================================================
    // ENREGISTREMENT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSuccess("");
        setError("");


        try {

            setSaving(true);


            const token =
                localStorage.getItem("marega_token");


            if (!token) {

                navigate(
                    "/login",
                    { replace: true }
                );

                return;

            }


            const response =
                await fetch(
                    `${API_URL}/agencies/settings`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(form)
                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "marega_token"
                );

                navigate(
                    "/login",
                    { replace: true }
                );

                return;

            }


            if (
                !response.ok
            ) {

                throw new Error(
                    data.error ||
                    "Impossible d'enregistrer les paramètres."
                );

            }


            setSuccess(
                "Les paramètres de l'agence ont été enregistrés avec succès."
            );


            if (data.agency) {

                setForm({
                    name:
                        data.agency.name || "",

                    type:
                        data.agency.type || "",

                    city:
                        data.agency.city || "",

                    country:
                        data.agency.country || "",

                    address:
                        data.agency.address || "",

                    phone:
                        data.agency.phone || "",

                    email:
                        data.agency.email || "",

                    ninea:
                        data.agency.ninea || "",

                    rccm:
                        data.agency.rccm || ""
                });

            }

        }
        catch (err) {

            console.error(
                "Erreur sauvegarde paramètres agence :",
                err
            );

            setError(
                err.message ||
                "Impossible d'enregistrer les paramètres."
            );

        }
        finally {

            setSaving(false);

        }

    };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (loading) {

        return (

            <Layout>

                <div className="agency-settings-loading">

                    Chargement des paramètres...

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div className="agency-settings-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="agency-settings-header">

                    <div>

                        <span className="agency-settings-eyebrow">
                            ADMINISTRATION
                        </span>

                        <h1>
                            Paramètres de l'agence
                        </h1>

                        <p>
                            Gérez les informations générales et
                            les informations légales de votre agence.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div className="agency-settings-message error">

                        {error}

                    </div>

                )}


                {success && (

                    <div className="agency-settings-message success">

                        {success}

                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="agency-settings-layout"
                >


                    {/* =================================================
                        INFORMATIONS GÉNÉRALES
                    ================================================= */}

                    <section className="agency-settings-card">

                        <div className="agency-settings-card-header">

                            <div>

                                <span>
                                    IDENTITÉ
                                </span>

                                <h2>
                                    Informations générales
                                </h2>

                                <p>
                                    Les informations principales
                                    visibles dans MAREGA.
                                </p>

                            </div>

                        </div>


                        <div className="agency-settings-grid">


                            <div className="agency-settings-field">

                                <label htmlFor="name">
                                    Nom de l'agence
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="agency-settings-field">

                                <label htmlFor="type">
                                    Type d'agence
                                </label>

                                <input
                                    id="type"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="agency-settings-field">

                                <label htmlFor="city">
                                    Ville
                                </label>

                                <input
                                    id="city"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="agency-settings-field">

                                <label htmlFor="country">
                                    Pays
                                </label>

                                <input
                                    id="country"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="agency-settings-field agency-settings-field-full">

                                <label htmlFor="address">
                                    Adresse
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    rows="3"
                                />

                            </div>


                            <div className="agency-settings-field">

                                <label htmlFor="phone">
                                    Téléphone
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Ex. 77 000 00 00"
                                />

                            </div>


                            <div className="agency-settings-field">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="contact@agence.sn"
                                />

                            </div>

                        </div>

                    </section>



                    {/* =================================================
                        INFORMATIONS LÉGALES
                    ================================================= */}

                    <section className="agency-settings-card">

                        <div className="agency-settings-card-header">

                            <div>

                                <span>
                                    CONFORMITÉ
                                </span>

                                <h2>
                                    Informations légales
                                </h2>

                                <p>
                                    Références administratives
                                    de votre agence.
                                </p>

                            </div>

                        </div>


                        <div className="agency-settings-grid">


                            <div className="agency-settings-field">

                                <label htmlFor="ninea">
                                    NINEA
                                </label>

                                <input
                                    id="ninea"
                                    name="ninea"
                                    value={form.ninea}
                                    onChange={handleChange}
                                    placeholder="Numéro NINEA"
                                />

                            </div>


                            <div className="agency-settings-field">

                                <label htmlFor="rccm">
                                    RCCM
                                </label>

                                <input
                                    id="rccm"
                                    name="rccm"
                                    value={form.rccm}
                                    onChange={handleChange}
                                    placeholder="Numéro RCCM"
                                />

                            </div>

                        </div>

                    </section>



                    {/* =================================================
                        DOCUMENTS / IDENTITÉ VISUELLE
                    ================================================= */}

                    <section className="agency-settings-card">

                        <div className="agency-settings-card-header">

                            <div>

                                <span>
                                    IDENTITÉ VISUELLE
                                </span>

                                <h2>
                                    Logo et documents
                                </h2>

                                <p>
                                    Le logo et les modèles PDF sont
                                    gérés dans l'espace dédié.
                                </p>

                            </div>

                        </div>


                        <div className="agency-settings-documents">

                            <div>

                                <strong>
                                    Documents de l'agence
                                </strong>

                                <p>
                                    Logo, modèle de contrat et modèle
                                    de reçu.
                                </p>

                            </div>


                            <Link
                                to="/admin/agency-documents"
                                className="agency-settings-documents-link"
                            >
                                Gérer les documents
                            </Link>

                        </div>

                    </section>



                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="agency-settings-actions">

                        <button
                            type="submit"
                            className="agency-settings-save"
                            disabled={saving}
                        >

                            {saving
                                ? "Enregistrement..."
                                : "Enregistrer les paramètres"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </Layout>

    );

}