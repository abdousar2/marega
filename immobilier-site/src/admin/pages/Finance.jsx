import { useEffect, useState } from "react";

import Layout from "../Layout";

import {
    PageHeader,
    Card,
    Badge,
    Button,
    Empty
} from "../../components/ui";

import FinanceService from "../../services/finance.service";


export default function Finance() {

    // =========================================================
    // ÉTAT
    // =========================================================

    const [period, setPeriod] =
        useState("daily");

    const [date, setDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );

    const [start, setStart] =
        useState("");

    const [end, setEnd] =
        useState("");

    const [report, setReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // CHARGEMENT
    // =========================================================

    async function loadReport() {

        try {

            setLoading(true);

            setError("");


            let params = {
                period
            };


            if (period === "custom") {

                if (!start || !end) {

                    setReport(null);

                    setLoading(false);

                    return;

                }


                params.start = start;
                params.end = end;

            }

            else {

                params.date = date;

            }


            const data =
                await FinanceService.getReport(
                    params
                );


            setReport(data);

        }

        catch (err) {

            console.error(
                "Erreur chargement situation financière :",
                err
            );

            setError(
                err.message ||
                "Impossible de charger la situation financière."
            );

            setReport(null);

        }

        finally {

            setLoading(false);

        }

    }


    // =========================================================
    // CHARGEMENT INITIAL
    // =========================================================

    useEffect(() => {

        loadReport();

    }, []);


    // =========================================================
    // OUTILS
    // =========================================================

    function formatMoney(value) {

        return Number(
            value || 0
        ).toLocaleString(
            "fr-FR"
        );

    }


    function formatDate(value) {

        if (!value) {

            return "—";

        }


        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatShortDate(value) {

        if (!value) {

            return "—";

        }


        return new Date(
            value
        ).toLocaleDateString(
            "fr-FR"
        );

    }


    function getPeriodLabel() {

        if (!report?.period) {

            return "";

        }


        if (
            report.period.start ===
            report.period.end
        ) {

            return formatDate(
                report.period.start
            );

        }


        return (
            `${formatDate(
                report.period.start
            )} au ${formatDate(
                report.period.end
            )}`
        );

    }


    function getPeriodName() {

        switch (period) {

            case "daily":
                return "Journalière";

            case "weekly":
                return "Hebdomadaire";

            case "monthly":
                return "Mensuelle";

            case "yearly":
                return "Annuelle";

            case "custom":
                return "Personnalisée";

            default:
                return "Situation";

        }

    }


    function handlePeriodChange(
        newPeriod
    ) {

        setPeriod(
            newPeriod
        );

        setReport(null);

        setError("");


        if (
            newPeriod === "custom"
        ) {

            setStart("");
            setEnd("");

        }

    }


    // =========================================================
    // CHARGEMENT
    // =========================================================

    if (
        loading &&
        !report
    ) {

        return (

            <Layout>

                <div className="
                    py-20
                    text-center
                    text-slate-500
                ">

                    Chargement de la situation financière...

                </div>

            </Layout>

        );

    }


    // =========================================================
    // RENDU
    // =========================================================

    return (

        <Layout>

            <div className="
                space-y-6
                pb-10
            ">


                {/* ================================================= */}
                {/* EN-TÊTE */}
                {/* ================================================= */}

                <PageHeader

                    title="Situation financière"

                    subtitle="
                        Analyse des encaissements et des dépenses
                        selon la période sélectionnée.
                    "

                />
                <br></br>


                {/* ================================================= */}
                {/* FILTRES */}
                {/* ================================================= */}

                <Card>

                    <div className="
                        flex
                        flex-wrap
                        items-end
                        gap-8
                        justify-between
                    ">


                        {/* PÉRIODE */}

                        <div className="
                            flex-1
                            min-w-[500px]
                        ">

                            <p className="
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-3
                            ">
                                Période
                            </p>

                            <div className="
                                flex
                                items-center
                                gap-2
                                flex-wrap
                            ">

                                {[
                                    ["daily", "Jour"],
                                    ["weekly", "Semaine"],
                                    ["monthly", "Mois"],
                                    ["yearly", "Année"],
                                    ["custom", "Personnalisée"]
                                ].map(
                                    ([value, label]) => (

                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                handlePeriodChange(value)
                                            }
                                            className={`
                                                h-11
                                                px-5
                                                rounded-xl
                                                text-sm
                                                font-semibold
                                                border
                                                transition-all
                                                whitespace-nowrap

                                                ${
                                                    period === value
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                                }
                                            `}
                                        >

                                            {label}

                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                        {/* DATE SIMPLE */}

                        {period !== "custom" && (

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-3
                                ">
                                    Date de référence
                                </label>

                                <input
                                    type="date"
                                    value={date}
                                    onChange={e =>
                                        setDate(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        border
                                        border-slate-200
                                        rounded-xl
                                        px-4
                                        py-2.5
                                        bg-white
                                        outline-none
                                        text-sm
                                        focus:border-blue-500
                                        focus:ring-4
                                        focus:ring-blue-500/10
                                    "
                                />

                            </div>

                        )}


                        {/* DATE PERSONNALISÉE */}

                        {period === "custom" && (

                            <div className="
                                grid
                                grid-cols-2
                                gap-3
                            ">

                                <div>

                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        mb-3
                                    ">
                                        Du
                                    </label>

                                    <input
                                        type="date"
                                        value={start}
                                        onChange={e =>
                                            setStart(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            border-slate-200
                                            rounded-xl
                                            px-4
                                            py-2.5
                                            bg-white
                                            outline-none
                                            text-sm
                                            focus:border-blue-500
                                            focus:ring-4
                                            focus:ring-blue-500/10
                                        "
                                    />

                                </div>


                                <div>

                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        mb-3
                                    ">
                                        Au
                                    </label>

                                    <input
                                        type="date"
                                        value={end}
                                        onChange={e =>
                                            setEnd(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            border-slate-200
                                            rounded-xl
                                            px-4
                                            py-2.5
                                            bg-white
                                            outline-none
                                            text-sm
                                            focus:border-blue-500
                                            focus:ring-4
                                            focus:ring-blue-500/10
                                        "
                                    />

                                </div>

                            </div>

                        )}                       


                        {/* ACTUALISER */}

                        <Button

                            onClick={
                                loadReport
                            }

                            disabled={
                                period === "custom" &&
                                (!start || !end)
                            }

                        >

                            ↻ Actualiser

                        </Button>

                    </div>

                </Card>


                {/* ================================================= */}
                {/* ERREUR */}
                {/* ================================================= */}

                {error && (

                    <div className="
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-4
                        text-red-700
                    ">

                        <p className="font-semibold">
                            Impossible de charger le rapport
                        </p>

                        <p className="
                            text-sm
                            mt-1
                        ">
                            {error}
                        </p>

                    </div>

                )}
                <br></br>


                {report && (

                    <>


                        {/* ================================================= */}
                        {/* TITRE DE LA PÉRIODE */}
                        {/* ================================================= */}

                        <Card>

                            <div>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">
                                    Situation financière
                                </p>

                                <div className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-3
                                    mt-1
                                ">

                                    <h2 className="
                                        text-2xl
                                        font-bold
                                        text-slate-800
                                    ">
                                        {getPeriodLabel()}
                                    </h2>

                                    <Badge color="blue">

                                        {getPeriodName()}

                                    </Badge>

                                </div>

                            </div>

                        </Card>
                        <br></br>


                        {/* ================================================= */}
                        {/* CARTES FINANCIÈRES */}
                        {/* ================================================= */}

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-3
                            gap-4
                        ">


                            {/* ENCAISSEMENTS */}

                            <div className="
                                bg-white
                                border
                                border-slate-200
                                border-t-4
                                border-t-green-500
                                rounded-2xl
                                p-5
                                shadow-sm
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">

                                    <div>

                                        <p className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Encaissements
                                        </p>

                                        <p className="
                                            text-3xl
                                            font-bold
                                            text-green-600
                                            mt-2
                                            leading-tight
                                        ">
                                            {formatMoney(
                                                report.income?.total
                                            )}
                                            {" "}
                                            <span className="
                                                text-xl
                                            ">
                                                FCFA
                                            </span>
                                        </p>

                                        <p className="
                                            text-xs
                                            text-slate-400
                                            mt-2
                                        ">
                                            {report.income?.count || 0}
                                            {" "}
                                            paiement(s)
                                        </p>

                                    </div>


                                    <div className="
                                        w-14
                                        h-14
                                        rounded-full
                                        bg-green-50
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                        shrink-0
                                    ">
                                        💰
                                    </div>

                                </div>

                            </div>


                            {/* DÉPENSES */}

                            <div className="
                                bg-white
                                border
                                border-slate-200
                                border-t-4
                                border-t-red-500
                                rounded-2xl
                                p-5
                                shadow-sm
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">

                                    <div>

                                        <p className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Dépenses
                                        </p>

                                        <p className="
                                            text-3xl
                                            font-bold
                                            text-red-600
                                            mt-2
                                            leading-tight
                                        ">
                                            {formatMoney(
                                                report.expenses?.total
                                            )}
                                            {" "}
                                            <span className="
                                                text-xl
                                            ">
                                                FCFA
                                            </span>
                                        </p>

                                        <p className="
                                            text-xs
                                            text-slate-400
                                            mt-2
                                        ">
                                            {report.expenses?.count || 0}
                                            {" "}
                                            dépense(s)
                                        </p>

                                    </div>


                                    <div className="
                                        w-14
                                        h-14
                                        rounded-full
                                        bg-red-50
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                        shrink-0
                                    ">
                                        💸
                                    </div>

                                </div>

                            </div>


                            {/* SOLDE NET */}

                            <div className={`
                                bg-white
                                border
                                border-slate-200
                                border-t-4
                                ${
                                    Number(report.net) >= 0
                                        ? "border-t-blue-500"
                                        : "border-t-orange-500"
                                }
                                rounded-2xl
                                p-5
                                shadow-sm
                            `}>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">

                                    <div>

                                        <p className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Solde net
                                        </p>

                                        <p className={`
                                            text-3xl
                                            font-bold
                                            mt-2
                                            leading-tight
                                            ${
                                                Number(report.net) >= 0
                                                    ? "text-blue-600"
                                                    : "text-orange-600"
                                            }
                                        `}>

                                            {formatMoney(
                                                report.net
                                            )}
                                            {" "}
                                            <span className="
                                                text-xl
                                            ">
                                                FCFA
                                            </span>

                                        </p>

                                        <p className="
                                            text-xs
                                            text-slate-400
                                            mt-2
                                        ">
                                            Encaissements - Dépenses
                                        </p>

                                    </div>


                                    <div className="
                                        w-14
                                        h-14
                                        rounded-full
                                        bg-blue-50
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                        shrink-0
                                    ">
                                        📊
                                    </div>

                                </div>

                            </div>

                        </div>
                        <br></br>


                        {/* ================================================= */}
                        {/* RÉPARTITIONS */}
                        {/* ================================================= */}

                        <div className="
                            grid
                            grid-cols-1
                            lg:grid-cols-3
                            gap-4
                        ">


                            {/* MOYENS DE PAIEMENT */}

                            <Card>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                ">

                                    <h2 className="
                                        text-base
                                        font-bold
                                        text-slate-800
                                    ">
                                        Encaissements par moyen de paiement
                                    </h2>

                                    <span className="text-lg">
                                        💳
                                    </span>

                                </div>


                                {report.paymentMethods?.length === 0 ? (

                                    <Empty
                                        title="Aucun encaissement"
                                        subtitle="Aucun paiement sur cette période."
                                    />

                                ) : (

                                    <div>

                                        {report.paymentMethods.map(
                                            (method, index) => (

                                                <div
                                                    key={
                                                        method.payment_method
                                                    }
                                                    className={`
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                        py-3
                                                        ${
                                                            index > 0
                                                                ? "border-t border-slate-100"
                                                                : ""
                                                        }
                                                    `}
                                                >

                                                    <div>

                                                        <p className="
                                                            text-sm
                                                            font-semibold
                                                            text-slate-800
                                                        ">
                                                            {
                                                                method.payment_method
                                                            }
                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-slate-500
                                                            mt-1
                                                        ">
                                                            {
                                                                method.count
                                                            } paiement(s)
                                                        </p>

                                                    </div>


                                                    <strong className="
                                                        text-sm
                                                        text-green-600
                                                        whitespace-nowrap
                                                    ">

                                                        {formatMoney(
                                                            method.total
                                                        )} FCFA

                                                    </strong>

                                                </div>

                                            )
                                        )}


                                        <div className="
                                            border-t
                                            border-slate-200
                                            mt-2
                                            pt-3
                                            flex
                                            justify-between
                                        ">

                                            <strong className="
                                                text-sm
                                            ">
                                                Total
                                            </strong>

                                            <strong className="
                                                text-sm
                                                text-green-600
                                            ">
                                                {formatMoney(
                                                    report.income?.total
                                                )} FCFA
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </Card>


                            {/* COMPTABLES */}

                            <Card>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                ">

                                    <h2 className="
                                        text-base
                                        font-bold
                                        text-slate-800
                                    ">
                                        Encaissements par comptable
                                    </h2>

                                    <span className="text-lg">
                                        👤
                                    </span>

                                </div>


                                {report.cashiers?.length === 0 ? (

                                    <Empty
                                        title="Aucun encaissement"
                                        subtitle="Aucun comptable sur cette période."
                                    />

                                ) : (

                                    <div>

                                        {report.cashiers.map(
                                            (cashier, index) => (

                                                <div
                                                    key={
                                                        cashier.cashier_user_id
                                                    }
                                                    className={`
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                        py-3
                                                        ${
                                                            index > 0
                                                                ? "border-t border-slate-100"
                                                                : ""
                                                        }
                                                    `}
                                                >

                                                    <div>

                                                        <div className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            flex-wrap
                                                        ">

                                                            <p className="
                                                                text-sm
                                                                font-semibold
                                                                text-slate-800
                                                            ">
                                                                {
                                                                    cashier.cashier_name
                                                                    ||
                                                                    "Utilisateur inconnu"
                                                                }
                                                            </p>

                                                            {cashier.cashier_role && (

                                                                <Badge color="blue">

                                                                    {
                                                                        cashier.cashier_role
                                                                    }

                                                                </Badge>

                                                            )}

                                                        </div>

                                                        <p className="
                                                            text-xs
                                                            text-slate-500
                                                            mt-1
                                                        ">
                                                            {
                                                                cashier.count
                                                            } paiement(s)
                                                        </p>

                                                    </div>


                                                    <strong className="
                                                        text-sm
                                                        text-green-600
                                                        whitespace-nowrap
                                                    ">

                                                        {formatMoney(
                                                            cashier.total
                                                        )} FCFA

                                                    </strong>

                                                </div>

                                            )
                                        )}


                                        <div className="
                                            border-t
                                            border-slate-200
                                            mt-2
                                            pt-3
                                            flex
                                            justify-between
                                        ">

                                            <strong className="
                                                text-sm
                                            ">
                                                Total
                                            </strong>

                                            <strong className="
                                                text-sm
                                                text-green-600
                                            ">
                                                {formatMoney(
                                                    report.income?.total
                                                )} FCFA
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </Card>


                            {/* CATÉGORIES */}

                            <Card>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                ">

                                    <h2 className="
                                        text-base
                                        font-bold
                                        text-slate-800
                                    ">
                                        Dépenses par catégorie
                                    </h2>

                                    <span className="text-lg">
                                        🏷️
                                    </span>

                                </div>


                                {report.expenseCategories?.length === 0 ? (

                                    <Empty
                                        title="Aucune dépense"
                                        subtitle="Aucune dépense sur cette période."
                                    />

                                ) : (

                                    <div>

                                        {report.expenseCategories.map(
                                            (category, index) => (

                                                <div
                                                    key={
                                                        category.category
                                                    }
                                                    className={`
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                        py-3
                                                        ${
                                                            index > 0
                                                                ? "border-t border-slate-100"
                                                                : ""
                                                        }
                                                    `}
                                                >

                                                    <div>

                                                        <p className="
                                                            text-sm
                                                            font-semibold
                                                            text-slate-800
                                                        ">
                                                            {
                                                                category.category
                                                            }
                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-slate-500
                                                            mt-1
                                                        ">
                                                            {
                                                                category.count
                                                            } dépense(s)
                                                        </p>

                                                    </div>


                                                    <strong className="
                                                        text-sm
                                                        text-red-600
                                                        whitespace-nowrap
                                                    ">

                                                        {formatMoney(
                                                            category.total
                                                        )} FCFA

                                                    </strong>

                                                </div>

                                            )
                                        )}


                                        <div className="
                                            border-t
                                            border-slate-200
                                            mt-2
                                            pt-3
                                            flex
                                            justify-between
                                        ">

                                            <strong className="
                                                text-sm
                                            ">
                                                Total
                                            </strong>

                                            <strong className="
                                                text-sm
                                                text-red-600
                                            ">
                                                {formatMoney(
                                                    report.expenses?.total
                                                )} FCFA
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </Card>

                        </div>
                        <br></br>


                        {/* ================================================= */}
                        {/* TABLEAUX */}
                        {/* ================================================= */}

                        <div className="
                            grid
                            grid-cols-1
                            xl:grid-cols-2
                            gap-4
                        ">


                            {/* ================================================= */}
                            {/* ENCAISSEMENTS */}
                            {/* ================================================= */}

                            <Card>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                ">

                                    <div>

                                        <div className="
                                            flex
                                            items-center
                                            gap-3
                                        ">

                                            <h2 className="
                                                text-lg
                                                font-bold
                                                text-slate-800
                                            ">
                                                Encaissements
                                            </h2>

                                            <span className="
                                                text-xs
                                                text-slate-500
                                            ">
                                                {
                                                    report.income?.count || 0
                                                } paiement(s)
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {report.payments?.length === 0 ? (

                                    <Empty
                                        title="Aucun encaissement"
                                        subtitle="Aucun paiement sur cette période."
                                    />

                                ) : (

                                    <div className="
                                        overflow-x-auto
                                    ">

                                        <table className="
                                            w-full
                                            text-xs
                                        ">

                                            <thead>

                                                <tr className="
                                                    border-b
                                                    border-slate-200
                                                    text-left
                                                    text-slate-500
                                                ">

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Date
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Locataire
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Immeuble
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Appartement
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Moyen
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Comptable
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                        text-right
                                                    ">
                                                        Montant
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {report.payments.map(
                                                    payment => (

                                                        <tr
                                                            key={
                                                                payment.id
                                                            }
                                                            className="
                                                                border-b
                                                                border-slate-100
                                                                hover:bg-slate-50
                                                            "
                                                        >

                                                            <td className="
                                                                px-3
                                                                py-3
                                                                whitespace-nowrap
                                                            ">
                                                                {
                                                                    formatShortDate(
                                                                        payment.payment_date
                                                                    )
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                                font-medium
                                                            ">
                                                                {
                                                                    payment.tenant_name
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    payment.building_name
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    payment.apartment_number
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    payment.payment_method
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    payment.cashier_name
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                                text-right
                                                                font-bold
                                                                text-green-600
                                                                whitespace-nowrap
                                                            ">
                                                                {formatMoney(
                                                                    payment.amount
                                                                )} FCFA
                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </Card>


                            {/* ================================================= */}
                            {/* DÉPENSES */}
                            {/* ================================================= */}

                            <Card>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                ">

                                    <div>

                                        <div className="
                                            flex
                                            items-center
                                            gap-3
                                        ">

                                            <h2 className="
                                                text-lg
                                                font-bold
                                                text-slate-800
                                            ">
                                                Dépenses
                                            </h2>

                                            <span className="
                                                text-xs
                                                text-slate-500
                                            ">
                                                {
                                                    report.expenses?.count || 0
                                                } dépense(s)
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {report.expenseList?.length === 0 ? (

                                    <Empty
                                        title="Aucune dépense"
                                        subtitle="Aucune dépense sur cette période."
                                    />

                                ) : (

                                    <div className="
                                        overflow-x-auto
                                    ">

                                        <table className="
                                            w-full
                                            text-xs
                                        ">

                                            <thead>

                                                <tr className="
                                                    border-b
                                                    border-slate-200
                                                    text-left
                                                    text-slate-500
                                                ">

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Date
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Libellé
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Catégorie
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Bénéficiaire
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Moyen
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                    ">
                                                        Immeuble
                                                    </th>

                                                    <th className="
                                                        px-3
                                                        py-3
                                                        text-right
                                                    ">
                                                        Montant
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {report.expenseList.map(
                                                    expense => (

                                                        <tr
                                                            key={
                                                                expense.id
                                                            }
                                                            className="
                                                                border-b
                                                                border-slate-100
                                                                hover:bg-slate-50
                                                            "
                                                        >

                                                            <td className="
                                                                px-3
                                                                py-3
                                                                whitespace-nowrap
                                                            ">
                                                                {
                                                                    formatShortDate(
                                                                        expense.expense_date
                                                                    )
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                                font-medium
                                                            ">
                                                                {
                                                                    expense.label
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    expense.category
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    expense.beneficiary
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    expense.payment_method
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                            ">
                                                                {
                                                                    expense.building_name
                                                                    ||
                                                                    "—"
                                                                }
                                                            </td>


                                                            <td className="
                                                                px-3
                                                                py-3
                                                                text-right
                                                                font-bold
                                                                text-red-600
                                                                whitespace-nowrap
                                                            ">
                                                                {formatMoney(
                                                                    expense.amount
                                                                )} FCFA
                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </Card>

                        </div>


                        {/* ================================================= */}
                        {/* NOTE */}
                        {/* ================================================= */}

                        <div className="
                            rounded-xl
                            border
                            border-blue-100
                            bg-blue-50
                            px-4
                            py-3
                            flex
                            items-center
                            gap-3
                            text-sm
                            text-blue-700
                        ">

                            <span className="text-lg">
                                ℹ️
                            </span>

                            <p>
                                Les montants sont calculés uniquement
                                sur les paiements encaissés
                                <strong className="ml-1">
                                    (statut = Payé).
                                </strong>
                            </p>

                        </div>


                    </>

                )}

            </div>

        </Layout>

    );

}