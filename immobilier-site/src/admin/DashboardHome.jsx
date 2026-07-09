import { BuildingsContext } from "../context/BuildingsContext";
import { ApartmentsContext } from "../context/ApartmentsContext";
import { TenantsContext } from "../context/TenantsContext";
import { PaymentsContext } from "../context/PaymentsContext";
import { useContext } from "react";

export default function DashboardHome() {

  const { buildings } =
    useContext(BuildingsContext);

  const { apartments } =
    useContext(ApartmentsContext);

  const { tenants } =
    useContext(TenantsContext);

  const { payments } =
    useContext(PaymentsContext);

  const occupied =
    tenants.length;

  const occupationRate =
    apartments.length > 0
      ? Math.round(
          (occupied /
            apartments.length) *
            100
        )
      : 0;

  const totalPaid =
    payments
      .filter(
        (p) =>
          p.status === "Payé"
      )
      .reduce(
        (sum, p) =>
          sum +
          Number(p.amount),
        0
      );

  const totalUnpaid =
    payments
      .filter(
        (p) =>
          p.status === "Impayé"
      )
      .reduce(
        (sum, p) =>
          sum +
          Number(p.amount),
        0
      );

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">
        Tableau de bord
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-slate-500">
            Immeubles
          </h2>

          <p className="text-4xl font-bold mt-3">
            {buildings.length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-slate-500">
            Appartements
          </h2>

          <p className="text-4xl font-bold mt-3">
            {apartments.length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-slate-500">
            Locataires
          </h2>

          <p className="text-4xl font-bold mt-3">
            {tenants.length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-slate-500">
          Taux d'occupation
        </h2>

        <p className="text-4xl font-bold mt-3">
          {occupationRate}%
        </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6"></div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-slate-500">
            Total encaissé
          </h2>

          <p className="text-4xl font-bold mt-3">
            {totalPaid.toLocaleString()}
          </p>

          <p className="mt-2">
            FCFA
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-slate-500">
            Total impayé
          </h2>

          <p className="text-4xl font-bold mt-3">
            {totalUnpaid.toLocaleString()}
          </p>

          <p className="mt-2">
            FCFA
          </p>
        </div>

      </div>
    </>
  );
}