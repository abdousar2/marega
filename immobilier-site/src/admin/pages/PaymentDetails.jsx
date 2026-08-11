import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../Layout";

import {
    PageHeader,
    Card,
    Badge,
    Button
} from "../../components/ui";

import PaymentsService from "../../services/payments.service";

import { API_BASE } from "../../services/config";

export default function PaymentDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [payment, setPayment] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        async function loadPayment() {

            try {

                const data =
                    await PaymentsService.getById(id);

                setPayment(data);

            }

            catch (err) {

                console.error(err);

            }

            finally {

                setLoading(false);

            }

        }

        loadPayment();

    }, [id]);


    const formatMoney = (value) => {

        return Number(
            value || 0
        ).toLocaleString("fr-FR");

    };


    const formatDate = (value) => {

        if (!value) {
            return "—";
        }

        return new Date(value)
            .toLocaleDateString("fr-FR");

    };


    if (loading) {

        return (

            <Layout>

                <h2 className="text-xl font-bold">

                    Chargement du paiement...

                </h2>

            </Layout>

        );

    }


    if (!payment) {

        return (

            <Layout>

                <Card>

                    <h2 className="text-xl font-bold">

                        Paiement introuvable

                    </h2>

                    <p className="text-slate-500 mt-2">

                        Le paiement demandé
                        n'existe pas.

                    </p>

                    <div className="mt-6">

                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate(
                                    "/admin/payments"
                                )
                            }
                        >
                            ← Retour aux paiements
                        </Button>

                    </div>

                </Card>

            </Layout>

        );

    }


    return (

        <Layout>

            <PageHeader

                title="Détail du paiement"

                subtitle={`Paiement #${payment.id}`}

            />


            <br />


            <div className="space-y-6">


                {/* =========================
                    INFORMATIONS PRINCIPALES
                ========================== */}

                <Card>

                    <div className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                    ">

                        <div>

                            <p className="
                                text-sm
                                text-slate-500
                            ">
                                Montant encaissé
                            </p>

                            <h2 className="
                                text-4xl
                                font-bold
                                text-green-600
                                mt-2
                            ">

                                {formatMoney(
                                    payment.amount
                                )} FCFA

                            </h2>

                        </div>


                        <Badge
                            color={
                                payment.status === "Payé"
                                    ? "green"
                                    : "red"
                            }
                        >

                            {payment.status}

                        </Badge>

                    </div>

                </Card>
                <br></br>


                {/* =========================
                    DETAILS
                ========================== */}

                <div className="
                    grid
                    grid-cols-1
                    lg:grid-cols-2
                    gap-6
                ">


                    <Card>

                        <h2 className="
                            text-xl
                            font-bold
                            mb-6
                        ">

                            👤 Locataire

                        </h2>


                        <div className="space-y-4">

                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Nom complet
                                </p>

                                <p className="font-semibold">

                                    {payment.tenant_name || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Contrat
                                </p>

                                <p className="font-semibold">

                                    {payment.contract_number || "—"}

                                </p>

                            </div>

                        </div>

                    </Card>


                    <Card>

                        <h2 className="
                            text-xl
                            font-bold
                            mb-6
                        ">

                            🏠 Logement

                        </h2>


                        <div className="space-y-4">

                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Immeuble
                                </p>

                                <p className="font-semibold">

                                    {payment.building_name || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Adresse
                                </p>

                                <p className="font-semibold">

                                    {payment.address || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Appartement
                                </p>

                                <p className="font-semibold">

                                    {payment.apartment_number || "—"}

                                </p>

                            </div>

                        </div>

                    </Card>


                    <Card>

                        <h2 className="
                            text-xl
                            font-bold
                            mb-6
                        ">

                            💳 Paiement

                        </h2>


                        <div className="space-y-4">

                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Mois concerné
                                </p>

                                <p className="font-semibold">

                                    {formatDate(
                                        payment.payment_month
                                    )}

                                </p>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Date de paiement
                                </p>

                                <p className="font-semibold">

                                    {formatDate(
                                        payment.payment_date
                                    )}

                                </p>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Moyen de paiement
                                </p>

                                <p className="font-semibold">

                                    {payment.payment_method || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Référence
                                </p>

                                <p className="font-semibold">

                                    {payment.reference || "—"}

                                </p>

                            </div>

                        </div>

                    </Card>


                    <Card>

                        <h2 className="
                            text-xl
                            font-bold
                            mb-6
                        ">

                            📄 Quittance

                        </h2>


                        {payment.receipt_path ? (

                            <a

                                href={
                                    `${API_BASE}${payment.receipt_path}`
                                }

                                target="_blank"

                                rel="noreferrer"

                                className="
                                    inline-flex
                                    items-center
                                    px-5
                                    py-3
                                    rounded-xl
                                    bg-green-600
                                    text-white
                                    font-semibold
                                    hover:bg-green-700
                                    transition
                                "

                            >

                                📄 Voir la quittance

                            </a>

                        ) : (

                            <p className="
                                text-slate-500
                            ">

                                Aucune quittance disponible.

                            </p>

                        )}

                    </Card>

                </div>


                {/* =========================
                    NOTES
                ========================== */}

                {payment.notes && (

                    <Card>

                        <h2 className="
                            text-xl
                            font-bold
                            mb-4
                        ">

                            📝 Notes

                        </h2>

                        <p className="
                            text-slate-600
                        ">

                            {payment.notes}

                        </p>

                    </Card>

                )}
                <br></br>


                {/* =========================
                    RETOUR
                ========================== */}

                <div>

                    <Button

                        variant="secondary"

                        onClick={() =>
                            navigate(
                                "/admin/payments"
                            )
                        }

                    >

                        ← Retour aux paiements

                    </Button>

                </div>


            </div>

        </Layout>

    );

}