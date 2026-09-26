import { useContext, useMemo, useState, useEffect } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import { API_BASE } from "../../services/config";

import Layout from "../Layout";

import {
    PageHeader,
    StatsCard,
    SearchBar,
    Badge,
    Empty,
    Button,
} from "../../components/ui";

import { RentsContext } from "../../context/RentsContext";

import { useAuth } from "../../context/AuthContext";

import {
    hasPermission
} from "../../config/permissions";


import "./Rents.css";

export default function Rents() {

    const { user } = useAuth();

    const role =
        user?.role;

    const canCreatePayment =
        hasPermission(
            role,
            "payments",
            "create"
        );

    const { rents, loading } = useContext(RentsContext);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const location = useLocation();
    const navigate = useNavigate();

    const showSuccess =
        new URLSearchParams(location.search).get("success") === "1";

    useEffect(() => {

        const params =
            new URLSearchParams(location.search);

        if (params.get("success") !== "1") {
            return;
        }

        const timer = setTimeout(() => {

            navigate("/admin/rents", {
                replace: true
            });

        }, 3000);

        return () =>
            clearTimeout(timer);

    }, [location.search, navigate]);
   

    function getLateDays(dueDate) {

        const today = new Date();

        const due = new Date(dueDate);

        const diff =
            Math.floor(
                (today - due) /
                (1000 * 60 * 60 * 24)
            );

        return Math.max(diff, 0);

    }

    function getRentStatus(rent) {

        if (rent.business_status) {
            return rent.business_status;
        }

        if (
            rent.status === "Payé" ||
            rent.payment_id !== null
        ) {
            return "Payé";
        }

        return "En attente";
    }

    const paidRents =
        rents.filter(
            r => getRentStatus(r) === "Payé"
        );

    const waitingRents =
        rents.filter(
            r => getRentStatus(r) === "En attente"
        );

    const todayRents =
        rents.filter(
            r => getRentStatus(r) === "À échéance aujourd'hui"
        );

    const lateRents =
        rents.filter(
            r => getRentStatus(r) === "En retard"
        );

    const filteredRents = useMemo(() => {

        return rents

            // =====================================================
            // FILTRE PAR STATUT MÉTIER
            // =====================================================
            .filter((rent) => {

                const status = getRentStatus(rent);

                if (filter === "paid") {
                    return status === "Payé";
                }

                if (filter === "waiting") {
                    return status === "En attente";
                }

                if (filter === "today") {
                    return status === "À échéance aujourd'hui";
                }

                if (filter === "late") {
                    return status === "En retard";
                }

                return true;

            })

            // =====================================================
            // RECHERCHE
            // =====================================================
            .filter((rent) => {

                const keyword =
                    search
                        .toLowerCase()
                        .trim();

                if (!keyword) {
                    return true;
                }

                const rentStatus =
                    getRentStatus(rent);

                return (

                    (rent.tenant_name || "")
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    (rent.contract_number || "")
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    (rent.apartment_number || "")
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    (rentStatus || "")
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    (rent.status || "")
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    new Date(rent.due_month)
                        .toLocaleDateString(
                            "fr-FR",
                            {
                                month: "long",
                                year: "numeric"
                            }
                        )
                        .toLowerCase()
                        .includes(keyword)

                );

            });

    }, [rents, search, filter]);

    if (loading) {

        return (

            <Layout>

                <h2>Chargement des loyers...</h2>

            </Layout>

        );

    }

    return (

        <Layout>

            <PageHeader
                title="Gestion des loyers"
                subtitle="Suivi automatique des échéances générées par les contrats."
            />
                      

            {showSuccess && (

            <div
                className="
                    mb-6
                    bg-green-100
                    text-green-700
                    border
                    border-green-300
                    rounded-xl
                    p-4
                    font-semibold
                "
            >

                ✅ Paiement enregistré avec succès.

            </div>

            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">

                <StatsCard
                    title="Total"
                    value={rents.length}
                    color="blue"
                />

                <StatsCard
                    title="Payés"
                    value={paidRents.length}
                    color="green"
                />

                <StatsCard
                    title="En attente"
                    value={waitingRents.length}
                    color="orange"
                />

                <StatsCard
                    title="Aujourd'hui"
                    value={todayRents.length}
                    color="blue"
                />

                <StatsCard
                    title="En retard"
                    value={lateRents.length}
                    color="red"
                />

            </div>
            <br></br>
            
            <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un locataire..."
            />
            <br></br>
            
            <div className="flex flex-wrap gap-3 mt-6 mb-8">

                <Button
                    variant={filter === "all" ? "primary" : "secondary"}
                    onClick={() => setFilter("all")}
                    color="blue"
                >
                    Tous
                </Button>

                <Button
                    variant={filter === "paid" ? "primary" : "secondary"}
                    onClick={() => setFilter("paid")}
                    color="green"
                >
                    Payés
                </Button>

                <Button
                    variant={filter === "waiting" ? "primary" : "secondary"}
                    onClick={() => setFilter("waiting")}
                    color="orange"
                >
                    En attente
                </Button>

                <Button
                    variant={
                        filter === "today"
                            ? "primary"
                            : "secondary"
                    }
                    onClick={() => setFilter("today")}
                    color="blue"
                >
                    Aujourd'hui
                </Button>

                <Button
                    variant={filter === "late" ? "primary" : "secondary"}
                    onClick={() => setFilter("late")}
                    color="red"
                >
                    En retard
                </Button>

            </div>
            
            {filteredRents.length === 0 ? (

                <Empty
                    title="Aucun loyer"
                    subtitle="Aucun résultat trouvé."
                />

            ) : (

                <div className="rents-grid">

                    {filteredRents.map((rent) => (

                        <div
                            key={rent.id}
                            className="rent-card"
                        >

                            {/* =================================================
                                HEADER
                            ================================================= */}

                            <div className="rent-card-header">

                                <div className="rent-identity">

                                    <div
                                        className={`
                                            rent-avatar
                                            ${
                                                getRentStatus(rent) === "Payé"
                                                ? "rent-avatar-paid"
                                                : getRentStatus(rent) === "En retard"
                                                ? "rent-avatar-late"
                                                : "rent-avatar-waiting"
                                            }
                                        `}
                                    >

                                        {(rent.tenant_name || "?").charAt(0)}

                                    </div>


                                    <div className="rent-tenant">

                                        <h2>

                                            {rent.tenant_name}

                                        </h2>

                                        <p>

                                            Appartement {rent.apartment_number}

                                        </p>

                                    </div>

                                </div>


                                <Badge
                                    color={
                                        getRentStatus(rent) === "Payé"
                                            ? "green"
                                            : getRentStatus(rent) === "En retard"
                                            ? "red"
                                            : getRentStatus(rent) === "À échéance aujourd'hui"
                                            ? "blue"
                                            : "orange"
                                    }
                                >
                                    {getRentStatus(rent)}
                                </Badge>

                            </div>


                            {/* =================================================
                                INFORMATIONS
                            ================================================= */}

                            <div className="rent-information">

                                <p>

                                    📄 Contrat{" "}

                                    <strong>
                                        {rent.contract_number}
                                    </strong>

                                </p>


                                <p>

                                    📅 Mois :{" "}

                                    <strong>

                                        {new Date(
                                            rent.due_month
                                        ).toLocaleDateString(
                                            "fr-FR",
                                            {
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}

                                    </strong>

                                </p>


                                <p>

                                    ⏰ Échéance :{" "}

                                    <strong>

                                        {new Date(
                                            rent.due_date
                                        ).toLocaleDateString(
                                            "fr-FR"
                                        )}

                                    </strong>

                                </p>


                                {getRentStatus(rent) === "En retard" && (

                                    <p className="rent-late">

                                        🔥 En retard de{" "}
                                        {getLateDays(rent.due_date)} jours

                                    </p>

                                )}

                            </div>


                            {/* =================================================
                                MONTANT
                            ================================================= */}

                            <div className="rent-finance">

                                <div className="rent-finance-label">

                                    Montant

                                </div>


                                <div className="rent-amount">

                                    {Number(
                                        rent.amount
                                    ).toLocaleString()} FCFA

                                </div>


                                {getRentStatus(rent) === "Payé" && (

                                    <>

                                        <div className="rent-payment-label">

                                            Mode de paiement

                                        </div>


                                        <div className="rent-payment-method">

                                            {rent.payment_method}

                                        </div>

                                    </>

                                )}


                                {getRentStatus(rent) === "Payé" &&
                                rent.payment_date && (

                                    <div className="rent-payment-date">

                                        Payé le{" "}

                                        {new Date(
                                            rent.payment_date
                                        ).toLocaleDateString(
                                            "fr-FR"
                                        )}

                                    </div>

                                )}

                            </div>


                            {/* =================================================
                                ACTION
                            ================================================= */}

                            <div className="rent-actions">

                                {getRentStatus(rent) === "Payé" ? (

                                    rent.receipt_path && (
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            onClick={() =>
                                                window.open(
                                                    `${API_BASE}${rent.receipt_path}`,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            📄 Télécharger la quittance
                                        </Button>
                                    )

                                ) : (

                                    canCreatePayment ? (

                                        <Link
                                            to={`/admin/payments?rent=${rent.id}`}
                                            className="rent-action-link"
                                        >

                                            <Button
                                                variant="primary"
                                                className="w-full"
                                            >

                                                💳 Encaisser

                                            </Button>

                                        </Link>

                                    ) : null

                                )}

                            </div>

                        </div>

                    ))}

                </div>

                        )}

                    </Layout>

                );

            }