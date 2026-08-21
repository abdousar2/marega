import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./Contact.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export default function Contact() {

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        company: "",
        buildings: "",
        tenants: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");


    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setSuccess("");
        setError("");


        // Validation minimale

        if (
            !form.name.trim() ||
            !form.phone.trim() ||
            !form.email.trim() ||
            !form.company.trim() ||
            !form.message.trim()
        ) {

            setError(
                "Veuillez renseigner tous les champs obligatoires."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                `${API_URL}/contact`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(form)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Une erreur est survenue lors de l'envoi."
                );

            }


            setSuccess(
                "Votre demande a bien été envoyée. Notre équipe vous recontactera dans les meilleurs délais."
            );


            // Réinitialisation du formulaire

            setForm({
                name: "",
                phone: "",
                email: "",
                company: "",
                buildings: "",
                tenants: "",
                message: ""
            });


        } catch (err) {

            console.error(
                "Erreur formulaire contact :",
                err
            );

            setError(
                err.message ||
                "Impossible d'envoyer votre demande."
            );

        } finally {

            setLoading(false);

        }

    };


    return (
        <>
            <Navbar />

            <main className="contact-page">

                {/* =========================================
                    HERO CONTACT
                ========================================= */}

                <section className="contact-hero">

                    <div className="contact-hero-content">

                        <h1>
                            Parlons de votre
                            <span> gestion immobilière</span>
                        </h1>

                        <p className="contact-intro">
                            Vous êtes une agence immobilière ou un gestionnaire
                            de patrimoine ? Découvrez comment TECHTRADISPORT
                            peut vous accompagner.
                        </p>

                    </div>


                    {/* =========================================
                        CONTENU
                    ========================================= */}

                    <div className="contact-container">


                        {/* =====================================
                            FORMULAIRE
                        ===================================== */}

                        <div className="contact-card contact-form-card">

                            <div className="contact-card-header">

                                <div className="contact-header-icon">
                                    👤
                                </div>

                                <div>

                                    <h2>
                                        Envoyez-nous votre demande
                                    </h2>

                                    <p>
                                        Un membre de notre équipe vous
                                        recontactera dans les meilleurs délais.
                                    </p>

                                </div>

                            </div>


                            <form onSubmit={handleSubmit}>

                                {/* NOM / TELEPHONE */}

                                <div className="contact-form-row">

                                    <div className="contact-field">

                                        <label>
                                            Nom complet
                                        </label>

                                        <div className="contact-input-wrapper">

                                            <span>
                                                👤
                                            </span>

                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="Votre nom"
                                                required
                                            />

                                        </div>

                                    </div>


                                    <div className="contact-field">

                                        <label>
                                            Téléphone
                                        </label>

                                        <div className="contact-input-wrapper">

                                            <span>
                                                ☎
                                            </span>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="+221 ..."
                                                required
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* EMAIL */}

                                <div className="contact-field">

                                    <label>
                                        Adresse e-mail
                                    </label>

                                    <div className="contact-input-wrapper">

                                        <span>
                                            ✉
                                        </span>

                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="contact@votreagence.sn"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* AGENCE */}

                                <div className="contact-field">

                                    <label>
                                        Agence / Entreprise
                                    </label>

                                    <div className="contact-input-wrapper">

                                        <span>
                                            ▣
                                        </span>

                                        <input
                                            type="text"
                                            name="company"
                                            value={form.company}
                                            onChange={handleChange}
                                            placeholder="Nom de votre agence ou entreprise"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* SELECTS */}

                                <div className="contact-form-row">

                                    <div className="contact-field">

                                        <label>
                                            Nombre d'immeubles gérés
                                        </label>

                                        <select
                                            name="buildings"
                                            value={form.buildings}
                                            onChange={handleChange}
                                        >

                                            <option value="">
                                                Sélectionnez
                                            </option>

                                            <option value="1 à 5">
                                                1 à 5
                                            </option>

                                            <option value="6 à 20">
                                                6 à 20
                                            </option>

                                            <option value="21 à 50">
                                                21 à 50
                                            </option>

                                            <option value="Plus de 50">
                                                Plus de 50
                                            </option>

                                        </select>

                                    </div>


                                    <div className="contact-field">

                                        <label>
                                            Nombre approximatif de locataires
                                        </label>

                                        <select
                                            name="tenants"
                                            value={form.tenants}
                                            onChange={handleChange}
                                        >

                                            <option value="">
                                                Sélectionnez
                                            </option>

                                            <option value="Moins de 20">
                                                Moins de 20
                                            </option>

                                            <option value="20 à 100">
                                                20 à 100
                                            </option>

                                            <option value="100 à 500">
                                                100 à 500
                                            </option>

                                            <option value="Plus de 500">
                                                Plus de 500
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* MESSAGE */}

                                <div className="contact-field">

                                    <label>
                                        Message
                                    </label>

                                    <div className="contact-textarea-wrapper">

                                        <span>
                                            ✎
                                        </span>

                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Présentez-nous votre besoin..."
                                            required
                                        />

                                    </div>

                                </div>


                                {/* MESSAGES */}

                                {error && (
                                    <div className="contact-message contact-message-error">
                                        {error}
                                    </div>
                                )}


                                {success && (
                                    <div className="contact-message contact-message-success">
                                        {success}
                                    </div>
                                )}


                                {/* BOUTON */}

                                <button
                                    type="submit"
                                    className="contact-submit"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading ? "⏳" : "➤"}
                                    </span>

                                    {loading
                                        ? "Envoi en cours..."
                                        : "Envoyer ma demande"
                                    }

                                </button>

                            </form>

                        </div>


                        {/* =====================================
                            POURQUOI NOUS CONTACTER
                        ===================================== */}

                        <div className="contact-card contact-benefits-card">

                            <div className="contact-card-header">

                                <div className="contact-header-icon">
                                    👥
                                </div>

                                <div>

                                    <h2>
                                        Pourquoi nous contacter ?
                                    </h2>

                                </div>

                            </div>


                            <div className="contact-benefits">

                                <div className="contact-benefit">

                                    <div className="benefit-icon">
                                        🖥️
                                    </div>

                                    <div>

                                        <h3>
                                            Démo personnalisée
                                        </h3>

                                        <p>
                                            Découvrez TECHTRADISPORT à travers
                                            une démonstration adaptée à votre
                                            activité.
                                        </p>

                                    </div>

                                </div>


                                <div className="contact-benefit">

                                    <div className="benefit-icon">
                                        ✚
                                    </div>

                                    <div>

                                        <h3>
                                            Solution adaptée
                                        </h3>

                                        <p>
                                            Nous vous aidons à choisir la
                                            solution la plus adaptée à vos
                                            besoins.
                                        </p>

                                    </div>

                                </div>


                                <div className="contact-benefit">

                                    <div className="benefit-icon">
                                        👥
                                    </div>

                                    <div>

                                        <h3>
                                            Accompagnement
                                        </h3>

                                        <p>
                                            Notre équipe vous accompagne à
                                            chaque étape de votre projet.
                                        </p>

                                    </div>

                                </div>


                                <div className="contact-benefit">

                                    <div className="benefit-icon">
                                        🎧
                                    </div>

                                    <div>

                                        <h3>
                                            Support réactif
                                        </h3>

                                        <p>
                                            Un support technique disponible
                                            pour vous assister au quotidien.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* SECURITE */}

                            <div className="contact-security">

                                <div className="security-icon">
                                    ✓
                                </div>

                                <div>

                                    <h3>
                                        Vos données sont sécurisées
                                    </h3>

                                    <p>
                                        Nous ne partageons jamais vos
                                        informations.
                                    </p>

                                    <a href="#">
                                        Consultez notre politique de
                                        confidentialité.
                                    </a>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

            <Footer />
        </>
    );
}