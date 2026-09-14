import { useContext, useMemo } from "react";

import { useNavigate } from "react-router-dom";

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

    Card, StatsCard, PageHeader, Badge

} from "../../components/ui";

import "./DashboardHome.css";

export default function DashboardHome() {

    const navigate = useNavigate();

    const { buildings } = useContext(BuildingsContext);

    const { apartments } = useContext(ApartmentsContext);

    const { tenants } = useContext(TenantsContext);

    const { contracts } = useContext(ContractsContext);

    const { payments } = useContext(PaymentsContext);

    const { expenses } = useContext(ExpensesContext);

    const activeContracts =
        contracts.filter(
            contract =>
                contract.status === "Actif"
        );

    const occupied =
        activeContracts.length;
    
    const available = Math.max(
        0,
        apartments.length - occupied
    );

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

    const paidPayments = payments.filter(
        payment => payment.status === "Payé"
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
                    amount: Number(payment.amount || 0),
                    url: `/admin/payments/${payment.id}`
                }));

            const expenseOperations = expenses
                .map(expense => ({
                    id: `expense-${expense.id}`,
                    type: "sortie",
                    date: expense.expense_date,
                    label: expense.label || "Dépense",
                    amount: Number(expense.amount || 0),
                    url: `/admin/expenses`
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

    <div className="dashboard-home">

        {/* =====================================================
            EN-TÊTE
        ===================================================== */}

        <div className="dashboard-header">

            <PageHeader
                title="Tableau de bord"
                subtitle="Bienvenue sur votre plateforme de gestion immobilière TECHTRADISPORT."
            />

        </div>


        {/* =====================================================
            STATISTIQUES
        ===================================================== */}

        <section className="dashboard-stats-grid">

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

        </section>


        {/* =====================================================
            BLOCS PRINCIPAUX
        ===================================================== */}

        <section className="dashboard-main-grid">

            {/* SITUATION FINANCIÈRE */}

            <Card className="dashboard-financial-card">

                <h2 className="dashboard-section-title">
                    Situation financière
                </h2>

                <div className="financial-grid">

                    <div className="financial-box financial-income">

                        <p>
                            Revenus encaissés
                        </p>

                        <h2>
                            {totalPaid.toLocaleString("fr-FR")}
                        </h2>

                        <span>
                            FCFA
                        </span>

                    </div>


                    <div className="financial-box financial-expense">

                        <p>
                            Dépenses
                        </p>

                        <h2>
                            {totalExpenses.toLocaleString("fr-FR")}
                        </h2>

                        <span>
                            FCFA
                        </span>

                    </div>


                    <div
                        className={
                            netBalance >= 0
                                ? "financial-box financial-balance-positive"
                                : "financial-box financial-balance-negative"
                        }
                    >

                        <p>
                            Solde net
                        </p>

                        <h2>
                            {netBalance.toLocaleString("fr-FR")}
                        </h2>

                        <span>
                            FCFA
                        </span>

                    </div>

                </div>

            </Card>


            {/* INDICATEURS LOYERS */}

            <Card className="dashboard-rent-card">

                <h2 className="dashboard-section-title">
                    Indicateurs des loyers
                </h2>

                <div className="rent-grid">

                    <div className="rent-box rent-unpaid">

                        <p>
                            Loyers impayés
                        </p>

                        <h2>
                            {totalUnpaid.toLocaleString("fr-FR")}
                        </h2>

                        <span>
                            FCFA
                        </span>

                    </div>


                    <div className="rent-box rent-paid">

                        <p>
                            Paiements encaissés
                        </p>

                        <h2>
                            {paidPayments.length}
                        </h2>

                        <span>
                            paiements
                        </span>

                    </div>

                </div>

            </Card>


            {/* OCCUPATION */}

            <Card className="dashboard-occupation-card">

                <h2 className="dashboard-section-title">
                    Occupation
                </h2>

                <div className="occupation-header">

                    <span>
                        Taux d'occupation
                    </span>

                    <strong>
                        {occupationRate}%
                    </strong>

                </div>


                <div className="occupation-progress">

                    <div
                        className="occupation-progress-bar"
                        style={{
                            width: `${occupationRate}%`
                        }}
                    />

                </div>


                <div className="occupation-stats">

                    <div>
                        <strong>
                            {occupied}
                        </strong>

                        <span>
                            Occupés
                        </span>
                    </div>


                    <div>
                        <strong>
                            {available}
                        </strong>

                        <span>
                            Libres
                        </span>
                    </div>


                    <div>
                        <strong>
                            {apartments.length}
                        </strong>

                        <span>
                            Total
                        </span>
                    </div>

                </div>

            </Card>

        </section>


        {/* =====================================================
            DERNIÈRES OPÉRATIONS
        ===================================================== */}

        <Card className="dashboard-operations-card">

            <div className="dashboard-card-header">

                <div>

                    <h2 className="dashboard-section-title">
                        Dernières opérations
                    </h2>

                    <p>
                        Les dernières entrées et sorties d'argent
                    </p>

                </div>

            </div>


            {recentOperations.length === 0 ? (

                <div className="dashboard-empty">
                    Aucune opération financière enregistrée.
                </div>

            ) : (

                <div className="operations-list">

                    {recentOperations.map(operation => (

                        <div
                            key={operation.id}
                            onClick={() =>
                                navigate(operation.url)
                            }
                            className="operation-row"
                        >

                            <div className="operation-left">

                                <div
                                    className={
                                        operation.type === "entrée"
                                            ? "operation-icon operation-income"
                                            : "operation-icon operation-expense"
                                    }
                                >
                                    {operation.type === "entrée"
                                        ? "↓"
                                        : "↑"
                                    }
                                </div>


                                <div>

                                    <p className="operation-label">
                                        {operation.label}
                                    </p>

                                    <p className="operation-date">

                                        {operation.date
                                            ? new Date(
                                                operation.date
                                            ).toLocaleDateString(
                                                "fr-FR"
                                            )
                                            : "Date inconnue"
                                        }

                                    </p>

                                </div>

                            </div>


                            <div className="operation-right">

                                <p
                                    className={
                                        operation.type === "entrée"
                                            ? "operation-amount operation-amount-income"
                                            : "operation-amount operation-amount-expense"
                                    }
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

                                <span>
                                    {operation.type === "entrée"
                                        ? "Entrée"
                                        : "Sortie"
                                    }
                                </span>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </Card>


        {/* =====================================================
            ALERTES + RÉSUMÉ
        ===================================================== */}

        <section className="dashboard-bottom-grid">

            <Card>

                <h2 className="dashboard-section-title">
                    Alertes
                </h2>

                <div className="dashboard-alert-list">

                    <div>
                        <span>
                            Dépenses enregistrées
                        </span>

                        <Badge color="orange">
                            {expenses.length}
                        </Badge>
                    </div>


                    <div>
                        <span>
                            Total des dépenses
                        </span>

                        <strong className="dashboard-danger">
                            {totalExpenses.toLocaleString("fr-FR")} FCFA
                        </strong>
                    </div>


                    <div>
                        <span>
                            Dépense moyenne
                        </span>

                        <strong>
                            {Math.round(
                                averageExpense
                            ).toLocaleString("fr-FR")} FCFA
                        </strong>
                    </div>


                    <div>
                        <span>
                            Contrats actifs
                        </span>

                        <Badge color="green">
                            {activeContracts.length}
                        </Badge>
                    </div>


                    <div>
                        <span>
                            Appartements disponibles
                        </span>

                        <Badge color="blue">
                            {available}
                        </Badge>
                    </div>


                    <div>
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

                <h2 className="dashboard-section-title">
                    Résumé
                </h2>

                <div className="dashboard-summary">

                    <div>
                        <span>
                            Immeubles
                        </span>

                        <strong>
                            {buildings.length}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Appartements
                        </span>

                        <strong>
                            {apartments.length}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Locataires
                        </span>

                        <strong>
                            {tenants.length}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Taux d'occupation
                        </span>

                        <strong className="dashboard-primary">
                            {occupationRate}%
                        </strong>
                    </div>

                </div>

            </Card>

        </section>

    </div>

);

}