import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/platform-agency-create.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export default function PlatformAgencyCreate() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        type: "",
        city: "",
        country: "Sénégal",
        address: "",
        phone: "",
        email: "",

        admin_first_name: "",
        admin_last_name: "",
        admin_email: "",
        admin_password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");



    function handleChange(e) {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    }



    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/platform/agencies`,
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
                    data.error ||
                    "Impossible de créer l'agence."
                );

            }


            setSuccess(
                data.message ||
                "Agence créée avec succès."
            );


            setTimeout(() => {

                navigate(
                    "/platform/agencies"
                );

            }, 1000);

        }

        catch (err) {

            console.error(
                "Erreur création agence :",
                err
            );

            setError(
                err.message ||
                "Une erreur est survenue."
            );

        }

        finally {

            setLoading(false);

        }

    }



    return (

        <div className="platform-agency-create">

            <div className="platform-agency-create-header">

                <div>

                    <p className="platform-agency-create-eyebrow">
                        ADMINISTRATION PLATEFORME
                    </p>

                    <h1>
                        Nouvelle agence
                    </h1>

                    <p>
                        Créez une nouvelle agence
                        utilisant la plateforme MAREGA.
                    </p>

                </div>


                <button
                    type="button"
                    className="platform-agency-back"
                    onClick={() =>
                        navigate("/platform/agencies")
                    }
                >
                    ← Retour aux agences
                </button>

            </div>



            <div className="platform-agency-create-card">

                <div className="platform-agency-create-card-header">

                    <div className="platform-agency-icon">
                        +
                    </div>

                    <div>

                        <h2>
                            Informations de l'agence
                        </h2>

                        <p>
                            Renseignez les informations
                            principales de l'agence.
                        </p>

                    </div>

                </div>



                {error && (

                    <div className="platform-agency-alert platform-agency-alert-error">
                        {error}
                    </div>

                )}



                {success && (

                    <div className="platform-agency-alert platform-agency-alert-success">
                        {success}
                    </div>

                )}



                <form
                    onSubmit={handleSubmit}
                    className="platform-agency-form"
                >

                    <div className="platform-agency-form-grid">


                        <div className="platform-field">

                            <label>
                                Nom de l'agence
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ex. Agence Immobilière Dakar"
                                required
                            />

                        </div>



                        <div className="platform-field">

                            <label>
                                Type d'agence
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                placeholder="Ex. Agence immobilière"
                                required
                            />

                        </div>



                        <div className="platform-field">

                            <label>
                                Ville
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="Ex. Dakar"
                                required
                            />

                        </div>



                        <div className="platform-field">

                            <label>
                                Pays
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="country"
                                value={form.country}
                                onChange={handleChange}
                                required
                            />

                        </div>



                        <div className="platform-field platform-field-full">

                            <label>
                                Adresse
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Adresse complète"
                            />

                        </div>



                        <div className="platform-field">

                            <label>
                                Téléphone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+221 77 000 00 00"
                            />

                        </div>



                        <div className="platform-field">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="contact@agence.sn"
                            />

                        </div>

                    </div>

                    <div className="platform-admin-section">

                        <div className="platform-admin-section-header">

                            <div className="platform-admin-icon">
                                👤
                            </div>

                            <div>

                                <h2>
                                    Administrateur principal
                                </h2>

                                <p>
                                    Ce compte permettra à l'agence
                                    d'accéder à son espace MAREGA.
                                </p>

                            </div>

                        </div>


                        <div className="platform-agency-form-grid">


                            <div className="platform-field">

                                <label>
                                    Prénom
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="admin_first_name"
                                    value={form.admin_first_name}
                                    onChange={handleChange}
                                    placeholder="Ex. Mamadou"
                                    required
                                />

                            </div>


                            <div className="platform-field">

                                <label>
                                    Nom
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="admin_last_name"
                                    value={form.admin_last_name}
                                    onChange={handleChange}
                                    placeholder="Ex. Diop"
                                    required
                                />

                            </div>


                            <div className="platform-field">

                                <label>
                                    Email de connexion
                                    <span>*</span>
                                </label>

                                <input
                                    type="email"
                                    name="admin_email"
                                    value={form.admin_email}
                                    onChange={handleChange}
                                    placeholder="admin@agence.sn"
                                    required
                                />

                            </div>


                            <div className="platform-field">

                                <label>
                                    Mot de passe initial
                                    <span>*</span>
                                </label>

                                <input
                                    type="password"
                                    name="admin_password"
                                    value={form.admin_password}
                                    onChange={handleChange}
                                    placeholder="Minimum 8 caractères"
                                    minLength={8}
                                    required
                                />

                            </div>

                        </div>

                    </div>



                    <div className="platform-agency-form-footer">

                        <button
                            type="button"
                            className="platform-agency-cancel"
                            onClick={() =>
                                navigate("/platform/agencies")
                            }
                        >
                            Annuler
                        </button>


                        <button
                            type="submit"
                            className="platform-agency-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Création..."
                                : "Créer l'agence"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}