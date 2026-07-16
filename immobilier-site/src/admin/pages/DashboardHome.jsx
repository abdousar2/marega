import { useContext } from "react";

import { BuildingsContext } from "../../context/BuildingsContext";
import { ApartmentsContext } from "../../context/ApartmentsContext";
import { TenantsContext } from "../../context/TenantsContext";
import { PaymentsContext } from "../../context/PaymentsContext";

export default function DashboardHome() {

    const { buildings } = useContext(BuildingsContext);
    const { apartments } = useContext(ApartmentsContext);
    const { tenants } = useContext(TenantsContext);
    const { payments } = useContext(PaymentsContext);

    const occupied = tenants.length;

    const occupationRate =
        apartments.length
            ? Math.round((occupied / apartments.length) * 100)
            : 0;

    const totalPaid = payments
        .filter(p => p.status === "Payé")
        .reduce((s, p) => s + Number(p.amount), 0);

    const totalUnpaid = payments
        .filter(p => p.status === "Impayé")
        .reduce((s, p) => s + Number(p.amount), 0);

    return (

        <>

            <div className="mb-10">

                <h1 className="text-4xl font-bold text-slate-800">

                    Bonjour 👋

                </h1>

                <p className="text-slate-500 mt-2">

                    Bienvenue sur votre plateforme MAREGA.

                </p>

            </div>

            <div className="grid lg:grid-cols-4 gap-6">

                <Card
                    icon="🏢"
                    title="Immeubles"
                    value={buildings.length}
                    color="bg-blue-600"
                />

                <Card
                    icon="🏠"
                    title="Appartements"
                    value={apartments.length}
                    color="bg-cyan-600"
                />

                <Card
                    icon="👤"
                    title="Locataires"
                    value={tenants.length}
                    color="bg-emerald-600"
                />

                <Card
                    icon="📄"
                    title="Occupation"
                    value={`${occupationRate}%`}
                    color="bg-orange-500"
                />

            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

                <div className="bg-white rounded-2xl shadow p-8">

                    <h2 className="text-xl font-semibold text-slate-700">

                        Revenus encaissés

                    </h2>

                    <div className="mt-6 text-5xl font-bold text-emerald-600">

                        {totalPaid.toLocaleString()}

                    </div>

                    <p className="text-slate-500 mt-2">

                        FCFA

                    </p>

                </div>

                <div className="bg-white rounded-2xl shadow p-8">

                    <h2 className="text-xl font-semibold text-slate-700">

                        Loyers impayés

                    </h2>

                    <div className="mt-6 text-5xl font-bold text-red-500">

                        {totalUnpaid.toLocaleString()}

                    </div>

                    <p className="text-slate-500 mt-2">

                        FCFA

                    </p>

                </div>

            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

                <div className="bg-white rounded-2xl shadow p-8">

                    <h2 className="text-xl font-bold mb-5">

                        État du parc immobilier

                    </h2>

                    <div className="space-y-4">

                        <Row
                            label="Appartements"
                            value={apartments.length}
                        />

                        <Row
                            label="Occupés"
                            value={occupied}
                        />

                        <Row
                            label="Disponibles"
                            value={apartments.length - occupied}
                        />

                    </div>

                </div>

                <div className="bg-white rounded-2xl shadow p-8">

                    <h2 className="text-xl font-bold mb-5">

                        Alertes

                    </h2>

                    <ul className="space-y-3">

                        <li>

                            📄 Contrats actifs :
                            <strong> {tenants.length}</strong>

                        </li>

                        <li>

                            🏠 Appartements disponibles :
                            <strong> {apartments.length - occupied}</strong>

                        </li>

                        <li>

                            💰 Paiements en attente :
                            <strong> {payments.filter(p => p.status === "Impayé").length}</strong>

                        </li>

                    </ul>

                </div>

            </div>

        </>

    );

}

function Card({ icon, title, value, color }) {

    return (

        <div className="bg-white rounded-2xl shadow overflow-hidden">

            <div className={`${color} h-2`} />

            <div className="p-6">

                <div className="text-3xl">

                    {icon}

                </div>

                <p className="text-slate-500 mt-4">

                    {title}

                </p>

                <div className="text-4xl font-bold mt-2">

                    {value}

                </div>

            </div>

        </div>

    );

}

function Row({ label, value }) {

    return (

        <div className="flex justify-between border-b pb-2">

            <span className="text-slate-500">

                {label}

            </span>

            <strong>

                {value}

            </strong>

        </div>

    );

}