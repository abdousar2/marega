import { useContext } from "react";

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

    return (

        <div className="space-y-10">

            <PageHeader

                title="Tableau de bord"

                subtitle="Bienvenue sur votre plateforme de gestion immobilière MAREGA."

            />

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

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                <Card className="xl:col-span-2">

                    <h2 className="text-2xl font-bold mb-8">

                        Revenus

                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        <div className="rounded-2xl bg-green-50 border border-green-100 p-8">

                            <p className="text-green-700 font-medium">

                                Revenus encaissés

                            </p>

                            <h2 className="text-5xl font-bold text-green-600 mt-5">

                                {totalPaid.toLocaleString()}

                            </h2>

                            <p className="text-slate-500 mt-3">

                                FCFA

                            </p>

                        </div>

                        <div className="rounded-2xl bg-red-50 border border-red-100 p-8">

                            <p className="text-red-700 font-medium">

                                Loyers impayés

                            </p>

                            <h2 className="text-5xl font-bold text-red-600 mt-5">

                                {totalUnpaid.toLocaleString()}

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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <Card>

                    <h2 className="text-2xl font-bold mb-6">

                        Alertes

                    </h2>

                    <div className="space-y-4">

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