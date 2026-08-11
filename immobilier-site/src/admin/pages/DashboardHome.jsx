import { useContext, useMemo } from "react";

import {
    BuildingsContext
} from "../../context/BuildingsContext";

import {
    ApartmentsContext
} from "../../context/ApartmentsContext";

import {
    TenantsContext
} from "../../context/TenantsContext";

import {
    ContractsContext
} from "../../context/ContractsContext";

import {
    PaymentsContext
} from "../../context/PaymentsContext";

import {
    ExpensesContext
} from "../../context/ExpensesContext";

import {

    Card,

    StatsCard,

    PageHeader,

    Badge

} from "../../components/ui";

export default function DashboardHome() {

    const { buildings } = useContext(BuildingsContext);

    const { apartments } = useContext(ApartmentsContext);

    const { tenants } = useContext(TenantsContext);

    const { contracts } = useContext(ContractsContext);

    const { payments } = useContext(PaymentsContext);

    const { expenses } = useContext(ExpensesContext);

    const occupied = tenants.length;

    const available = apartments.length - occupied;

    const occupationRate =
        apartments.length > 0
            ? Math.round(
                occupied * 100 / apartments.length
            )
            : 0;

    const totalPaid = payments

        .filter(p => p.status === "Payé")

        .reduce(

            (total, payment) =>

                total + Number(payment.amount),

            0

        );

    const totalUnpaid = payments

    

        .filter(

            payment => payment.status !== "Payé"

        )

        .reduce(

            (total, payment) =>

                total + Number(payment.amount),

            0

        );

    const totalExpenses = expenses.reduce(

            (total, expense) =>

                total + Number(expense.amount || 0),

            0

        );

        const netBalance =
            totalPaid - totalExpenses;

        const recentOperations = useMemo(() => {

            const paymentOperations = payments
                .filter(payment => payment.status === "Payé")
                .map(payment => ({
                    id: `payment-${payment.id}`,
                    type: "entrée",
                    date: payment.payment_date || payment.payment_month,
                    label: payment.tenant_name
                        ? `Loyer - ${payment.tenant_name}`
                        : "Paiement de loyer",
                    amount: Number(payment.amount || 0)
                }));

            const expenseOperations = expenses
                .map(expense => ({
                    id: `expense-${expense.id}`,
                    type: "sortie",
                    date: expense.expense_date,
                    label: expense.label || "Dépense",
                    amount: Number(expense.amount || 0)
                }));

            return [
                ...paymentOperations,
                ...expenseOperations
            ]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )
                .slice(0, 8);

        }, [payments, expenses]);

        const expenseCount = expenses.length;

        const averageExpense =
            expenseCount > 0
                ? totalExpenses / expenseCount
                : 0;

    return (

        

        <div className="space-y-10">

            <PageHeader

                title="Tableau de bord"

                subtitle="Bienvenue sur votre plateforme de gestion immobilière MAREGA."

            />
            <br></br>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                <StatsCard

                    title="Immeubles"

                    value={buildings.length}

                    icon="🏢"

                    color="blue"

                />

                <StatsCard

                    title="Appartements"

                    value={apartments.length}

                    icon="🏠"

                    color="green"

                />

                <StatsCard

                    title="Locataires"

                    value={tenants.length}

                    icon="👤"

                    color="orange"

                />

                <StatsCard

                    title="Contrats"

                    value={contracts.length}

                    icon="📄"

                    color="purple"

                />

            </div>
            <br></br>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                <Card className="xl:col-span-2">

                    <h2 className="text-2xl font-bold mb-8">

                        Situation financière

                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <div className="rounded-2xl bg-green-50 border border-green-100 p-8">

                            <p className="text-green-700 font-medium">

                                Revenus encaissés

                            </p>

                            <h2 className="text-4xl font-bold text-green-600 mt-5">

                                {totalPaid.toLocaleString()}

                            </h2>

                            <p className="text-slate-500 mt-3">

                                FCFA

                            </p>

                        </div>

                        <div className="rounded-2xl bg-red-50 border border-red-100 p-8">

                            <p className="text-red-700 font-medium">

                                Dépenses

                            </p>

                            <h2 className="text-4xl font-bold text-red-600 mt-5">

                                {totalExpenses.toLocaleString()}

                            </h2>

                            <p className="text-slate-500 mt-3">

                                FCFA

                            </p>

                        </div>

                        <div
                            className={`rounded-2xl border p-8 ${
                                netBalance >= 0
                                    ? "bg-blue-50 border-blue-100"
                                    : "bg-orange-50 border-orange-100"
                            }`}
                        >

                            <p
                                className={`font-medium ${
                                    netBalance >= 0
                                        ? "text-blue-700"
                                        : "text-orange-700"
                                }`}
                            >
                                Solde net
                            </p>

                            <h2
                                className={`text-4xl font-bold mt-5 ${
                                    netBalance >= 0
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                }`}
                            >
                                {netBalance.toLocaleString()}
                            </h2>

                            <p className="text-slate-500 mt-3">
                                FCFA
                            </p>

                        </div>

                    </div>

                </Card>

                <Card>

                    <h2 className="text-2xl font-bold mb-8">

                        Occupation

                    </h2>

                    <div className="flex justify-between mb-4">

                        <span className="text-slate-600">

                            Taux d'occupation

                        </span>

                        <strong>

                            {occupationRate}%

                        </strong>

                    </div>

                    <div className="w-full h-4 rounded-full bg-slate-200 overflow-hidden">

                        <div

                            className="h-4 bg-blue-600 transition-all duration-700"

                            style={{

                                width: `${occupationRate}%`

                            }}

                        />

                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-10">

                        <div className="bg-slate-50 rounded-xl p-5 text-center">

                            <div className="text-3xl font-bold">

                                {occupied}

                            </div>

                            <div className="text-sm text-slate-500 mt-2">

                                Occupés

                            </div>

                        </div>

                        <div className="bg-slate-50 rounded-xl p-5 text-center">

                            <div className="text-3xl font-bold">

                                {available}

                            </div>

                            <div className="text-sm text-slate-500 mt-2">

                                Libres

                            </div>

                        </div>

                        <div className="bg-slate-50 rounded-xl p-5 text-center">

                            <div className="text-3xl font-bold">

                                {apartments.length}

                            </div>

                            <div className="text-sm text-slate-500 mt-2">

                                Total

                            </div>

                        </div>

                    </div>

                </Card>

            </div>
            <br></br>

            <Card>

                <div className="flex items-center justify-between mb-6">

                    <div>

                        <h2 className="text-2xl font-bold">
                            Dernières opérations
                        </h2>

                        <p className="text-slate-500 text-sm mt-1">
                            Les dernières entrées et sorties d'argent
                        </p>

                    </div>

                </div>

                {recentOperations.length === 0 ? (

                    <div className="py-10 text-center text-slate-500">

                        Aucune opération financière enregistrée.

                    </div>

                ) : (

                    <div className="divide-y divide-slate-100">

                        {recentOperations.map(operation => (

                            <div
                                key={operation.id}
                                className="flex items-center justify-between py-5"
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className={`
                                            w-11
                                            h-11
                                            rounded-full
                                            flex
                                            items-center
                                            justify-center
                                            text-lg
                                            ${
                                                operation.type === "entrée"
                                                    ? "bg-green-100"
                                                    : "bg-red-100"
                                            }
                                        `}
                                    >

                                        {operation.type === "entrée"
                                            ? "↓"
                                            : "↑"}

                                    </div>

                                    <div>

                                        <p className="font-semibold text-slate-800">

                                            {operation.label}

                                        </p>

                                        <p className="text-sm text-slate-500 mt-1">

                                            {operation.date
                                                ? new Date(
                                                    operation.date
                                                ).toLocaleDateString("fr-FR")
                                                : "Date inconnue"
                                            }

                                        </p>

                                    </div>

                                </div>

                                <div className="text-right">

                                    <p
                                        className={`
                                            font-bold
                                            ${
                                                operation.type === "entrée"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        `}
                                    >

                                        {operation.type === "entrée"
                                            ? "+"
                                            : "-"
                                        }

                                        {operation.amount.toLocaleString(
                                            "fr-FR"
                                        )}

                                        {" "}FCFA

                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">

                                        {operation.type === "entrée"
                                            ? "Entrée"
                                            : "Sortie"
                                        }

                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </Card>
            <br></br>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <Card>

                    <h2 className="text-2xl font-bold mb-6">
                        Alertes
                    </h2>

                    <div className="space-y-4">

                        <div className="flex items-center justify-between">

                            <span>
                                Dépenses enregistrées
                            </span>

                            <Badge color="orange">
                                {expenses.length}
                            </Badge>

                        </div>

                        <div className="flex items-center justify-between">

                            <span>
                                Total des dépenses
                            </span>

                            <strong className="text-red-600">
                                {totalExpenses.toLocaleString()} FCFA
                            </strong>

                        </div>

                        <div className="flex items-center justify-between">

                            <span>
                                Dépense moyenne
                            </span>

                            <strong>
                                {Math.round(averageExpense).toLocaleString()} FCFA
                            </strong>

                        </div>

                        <div className="flex items-center justify-between">

                            <span>
                                Contrats actifs
                            </span>

                            <Badge color="green">
                                {contracts.length}
                            </Badge>

                        </div>

                        <div className="flex items-center justify-between">

                            <span>
                                Appartements disponibles
                            </span>

                            <Badge color="blue">
                                {available}
                            </Badge>

                        </div>

                        <div className="flex items-center justify-between">

                            <span>
                                Paiements impayés
                            </span>

                            <Badge color="red">
                                {
                                    payments.filter(
                                        p => p.status !== "Payé"
                                    ).length
                                }
                            </Badge>

                        </div>

                    </div>

                </Card>

                <Card>

                    <h2 className="text-2xl font-bold mb-6">

                        Résumé

                    </h2>

                    <div className="space-y-5">

                        <div className="flex justify-between">

                            <span className="text-slate-500">

                                Immeubles

                            </span>

                            <strong>

                                {buildings.length}

                            </strong>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-slate-500">

                                Appartements

                            </span>

                            <strong>

                                {apartments.length}

                            </strong>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-slate-500">

                                Locataires

                            </span>

                            <strong>

                                {tenants.length}

                            </strong>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-slate-500">

                                Taux d'occupation

                            </span>

                            <strong className="text-blue-600">

                                {occupationRate}%

                            </strong>

                        </div>

                    </div>

                </Card>

            </div>

        </div>

    );

}