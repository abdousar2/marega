import { useState } from "react";
import "./AgencyDocuments.css";

import Layout from "../Layout";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export default function AgencyDocuments() {

    const [logo, setLogo] = useState(null);
    const [contract, setContract] = useState(null);
    const [receipt, setReceipt] = useState(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setSuccess("");
        setError("");


        if (!logo && !contract && !receipt) {

            setError(
                "Veuillez sélectionner au moins un document."
            );

            return;
        }


        try {

            setLoading(true);


            const token =
                localStorage.getItem("marega_token");


            const formData =
                new FormData();


            if (logo) {

                formData.append(
                    "logo",
                    logo
                );

            }


            if (contract) {

                formData.append(
                    "contract",
                    contract
                );

            }


            if (receipt) {

                formData.append(
                    "receipt",
                    receipt
                );

            }


            const response =
                await fetch(
                    `${API_URL}/agencies/documents`,
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
                    data.message ||
                    "Erreur lors de l'envoi des documents."
                );

            }


            setSuccess(
                "Les documents de l'agence ont été enregistrés avec succès."
            );


            setLogo(null);
            setContract(null);
            setReceipt(null);


            e.target.reset();


        } catch (err) {

            console.error(
                "Erreur upload documents :",
                err
            );


            setError(
                err.message ||
                "Impossible d'envoyer les documents."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <Layout>

            <div className="agency-documents-page">


                {/* =====================================================
                    EN-TÊTE
                ===================================================== */}

                <div className="agency-documents-header">

                    <div>

                        <span className="agency-documents-eyebrow">
                            PARAMÈTRES
                        </span>


                        <h1>
                            Documents de l'agence
                        </h1>


                        <p>
                            Personnalisez les documents générés
                            par MAREGA avec l'identité de votre agence.
                        </p>

                    </div>

                </div>



                {/* =====================================================
                    CARTE
                ===================================================== */}

                <div className="agency-documents-card">


                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            LOGO
                        ================================================= */}

                        <div className="document-field">

                            <label>
                                Logo de l'agence
                            </label>


                            <p>
                                Formats acceptés : PNG, JPG ou WEBP
                            </p>


                            <input
                                type="file"
                                accept="
                                    image/png,
                                    image/jpeg,
                                    image/webp
                                "
                                onChange={(e) =>
                                    setLogo(
                                        e.target.files[0] || null
                                    )
                                }
                            />


                            {logo && (

                                <div className="selected-file">

                                    ✓ {logo.name}

                                </div>

                            )}

                        </div>



                        {/* =================================================
                            CONTRAT
                        ================================================= */}

                        <div className="document-field">

                            <label>
                                Modèle de contrat
                            </label>


                            <p>
                                Document PDF utilisé pour les contrats.
                            </p>


                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                    setContract(
                                        e.target.files[0] || null
                                    )
                                }
                            />


                            {contract && (

                                <div className="selected-file">

                                    ✓ {contract.name}

                                </div>

                            )}

                        </div>



                        {/* =================================================
                            REÇU
                        ================================================= */}

                        <div className="document-field">

                            <label>
                                Modèle de reçu
                            </label>


                            <p>
                                Document PDF utilisé pour les reçus.
                            </p>


                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                    setReceipt(
                                        e.target.files[0] || null
                                    )
                                }
                            />


                            {receipt && (

                                <div className="selected-file">

                                    ✓ {receipt.name}

                                </div>

                            )}

                        </div>



                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        {error && (

                            <div className="
                                document-message
                                error
                            ">

                                {error}

                            </div>

                        )}


                        {success && (

                            <div className="
                                document-message
                                success
                            ">

                                {success}

                            </div>

                        )}



                        {/* =================================================
                            BOUTON
                        ================================================= */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="document-submit"
                        >

                            {loading
                                ? "Enregistrement..."
                                : "Enregistrer les documents"
                            }

                        </button>


                    </form>


                </div>


            </div>

        </Layout>

    );

}