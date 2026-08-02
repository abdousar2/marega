import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../../services/config";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

export default function Rents() {

    const { rents, loading } = useContext(RentsContext);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const location = useLocation();

    useEffect(() => {

        const params = new URLSearchParams(location.search);

        if (params.get("success") === "1") {

            setShowSuccess(true);

            setTimeout(() => {

                setShowSuccess(false);

                navigate("/admin/rents", {
                    replace: true
                });

            }, 3000);

        }

    }, [location.search]);
    const navigate = useNavigate();

    const [showSuccess, setShowSuccess] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {

        if (location.state?.success) {

            setSuccessMessage(location.state.success);

            const timer = setTimeout(() => {

                setSuccessMessage("");

            }, 3000);

            return () => clearTimeout(timer);

        }

    }, [location.state]);

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

    

    const paidRents =
        rents.filter(r => r.status === "Payé");

    const waitingRents =
        rents.filter(r => r.status === "En attente");

    const lateRents =
        rents.filter(r => r.status === "En retard");

    const filteredRents = useMemo(() => {

        return rents

            .filter((rent) => {

                if (filter === "paid")
                    return rent.status === "Payé";

                if (filter === "waiting")
                    return rent.status === "En attente";

                if (filter === "late")
                    return rent.status === "En retard";

                return true;

            })

            .filter((rent) => {

                const keyword = search.toLowerCase();

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

                    (rent.status || "")
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    new Date(rent.due_month)
                        .toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric"
                        })
                        .toLowerCase()
                        .includes(keyword)

                );

            })

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
            <br></br>

            {successMessage && (

                <div
                    className="
                        mb-6
                        rounded-xl
                        bg-green-100
                        border
                        border-green-300
                        text-green-800
                        px-5
                        py-4
                        font-semibold
                    "
                >

                    ✅ {successMessage}

                </div>

            )}

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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

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
            <br></br><br></br>

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
                    variant={filter === "late" ? "primary" : "secondary"}
                    onClick={() => setFilter("late")}
                    color="red"
                >
                    En retard
                </Button>

            </div>
            <br></br>

            {filteredRents.length === 0 ? (

                <Empty
                    title="Aucun loyer"
                    subtitle="Aucun résultat trouvé."
                />

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                                {filteredRents.map((rent) => (

                                    <div
                                        key={rent.id}
                                        className="
                                        bg-white
                                        rounded-3xl
                                        border
                                        border-slate-200
                                        shadow-sm
                                        hover:shadow-xl
                                        hover:-translate-y-1
                                        transition
                                        duration-300
                                        p-7
                                        "
                                    >

                                        <div className="flex justify-between items-start">

                                            <div className="flex items-center gap-4">

                                                <div
                                                    className={`

                                                        w-14
                                                        h-14
                                                        rounded-full
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-xl
                                                        font-bold
                                                        text-white

                                                        ${
                                                            rent.status === "Payé"
                                                                ? "bg-green-600"
                                                                : rent.status === "En attente"
                                                                ? "bg-yellow-500"
                                                                : "bg-red-600"
                                                        }

                                                    `}
                                                >

                                                    {(rent.tenant_name || "?").charAt(0)}

                                                </div>

                                                <div>

                                                    <h2 className="text-xl font-bold">

                                                        {rent.tenant_name}

                                                    </h2>

                                                    <p className="text-slate-500">

                                                        Appartement {rent.apartment_number}

                                                    </p>

                                                </div>

                                            </div>

                                            <Badge

                                                color={
                                                    rent.status === "Payé"
                                                        ? "green"
                                                        : rent.status === "En attente"
                                                        ? "orange"
                                                        : "red"
                                                }

                                            >

                                                {rent.status}

                                            </Badge>

                                        </div>

                                        <div className="mt-6 space-y-3">

                                            <p>
                                                📄 Contrat <strong>{rent.contract_number}</strong>
                                            </p>

                                            <p>
                                                📅 Mois :
                                                <strong>
                                                    {" "}
                                                    {new Date(rent.due_month).toLocaleDateString(
                                                        "fr-FR",
                                                        {
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </strong>
                                            </p>

                                            <p>
                                                ⏰ Échéance :
                                                <strong>
                                                    {" "}
                                                    {new Date(rent.due_date).toLocaleDateString(
                                                        "fr-FR"
                                                    )}
                                                </strong>
                                            </p>

                                            {rent.status === "En retard" && (

                                                <p className="text-red-600 font-semibold">

                                                    🔥 En retard de
                                                    {getLateDays(rent.due_date)} jours

                                                </p>

                                            )}

                                        </div>

                                        <div className="mt-6 bg-slate-50 rounded-2xl p-5">

                                            <div className="text-slate-500 text-sm">
                                                Montant
                                            </div>

                                            <div className="text-2xl font-bold text-green-700 mt-2">

                                                {Number(rent.amount).toLocaleString()} FCFA

                                            </div>

                                            {rent.status === "Payé" && (

                                                <>

                                                    <div className="mt-3 text-sm text-slate-500">

                                                        Mode de paiement

                                                    </div>

                                                    <div className="font-semibold">

                                                        {rent.payment_method}

                                                    </div>

                                                </>

                                            )}

                                            {rent.status === "Payé" &&
                                            rent.payment_date && (

                                            <div className="text-sm text-slate-500 mt-2">

                                            Payé le

                                            {" "}

                                            {new Date(
                                                rent.payment_date
                                            ).toLocaleDateString("fr-FR")}

                                            </div>

                                            )}                                            

                                        </div>

                                        <div className="flex gap-3 mt-6">

                                            {rent.status === "Payé" ? (

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

                                                <Link
                                                    to={`/admin/payments?rent=${rent.id}`}
                                                >

                                                    <Button
                                                        variant="primary"
                                                        className="w-full"
                                                    >

                                                        💳 Encaisser

                                                    </Button>

                                                </Link>

                                            )}

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </Layout>

                );

            }