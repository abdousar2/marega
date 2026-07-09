import { useContext } from "react";
import { useParams } from "react-router-dom";

import Layout from "../Layout";

import {
  ApartmentsContext,
} from "../../context/ApartmentsContext";

import {
  BuildingsContext,
} from "../../context/BuildingsContext";

import {
  TenantsContext,
} from "../../context/TenantsContext";

import {
  PaymentsContext,
} from "../../context/PaymentsContext";

export default function ApartmentDetails() {

  const { id } = useParams();

  const { apartments } =
    useContext(ApartmentsContext);

  const { buildings } =
    useContext(BuildingsContext);

  const { tenants } =
    useContext(TenantsContext);

  const { payments } =
    useContext(PaymentsContext);

  const apartment =
    apartments.find(
      (a) => a.id == id
    );

  const building =
    buildings.find(
      (b) =>
        b.id ==
        apartment?.buildingId
    );

  const tenant =
    tenants.find(
      (t) =>
        t.apartmentId ==
          apartment?.id &&
        t.status === "Actif"
    );

  const tenantPayments =
    tenant
        ? payments.filter(
            (payment) =>
            payment.tenantId ==
            tenant.id
        )
        : [];


  const totalPaid =
    tenantPayments
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

  if (!apartment) {
    return (
      <Layout>
        <h1>
          Appartement introuvable
        </h1>
      </Layout>
    );
  }

  return (
    <Layout>

      <h1 className="text-4xl font-bold mb-8">
        Appartement {apartment.number}
      </h1>

      <div className="bg-white rounded-xl shadow p-8">

        <p className="mb-4">
          🏢 <strong>Immeuble :</strong>
          {" "}
          {building?.name}
        </p>

        <p className="mb-4">
          🏠 <strong>Type :</strong>
          {" "}
          {apartment.type}
        </p>

        <p className="mb-4">
          📐 <strong>Surface :</strong>
          {" "}
          {apartment.surface} m²
        </p>

        <p className="mb-4">
          💰 <strong>Loyer :</strong>
          {" "}
          {Number(
            apartment.rent
          ).toLocaleString()}
          {" "}
          FCFA
        </p>

        <p className="mb-4">
          🔐 <strong>Caution :</strong>
          {" "}
          {Number(
            apartment.deposit
          ).toLocaleString()}
          {" "}
          FCFA
        </p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold mb-4">
          Locataire actuel
        </h2>

          {tenant ? (
            <>
                <p>
                👤 {tenant.name}
                </p>

                <p className="mt-2">
                📞 {tenant.phone}
                </p>

                {tenant.email && (
                <p className="mt-2">
                    📧 {tenant.email}
                </p>
                )}

                <p className="mt-2">
                💼 {tenant.profession}
                </p>

                <p className="mt-2">
                📅 {tenant.entryDate}
                </p>
            </>
            ) : (
            <p>
                Aucun locataire actif
            </p>
            )}
          
          <hr className="my-8" />

            <h2 className="text-2xl font-bold mb-4">
            Historique des paiements
            </h2>

            <p className="mb-6 font-semibold">
            Total encaissé :
            {totalPaid.toLocaleString()} FCFA
            </p>

            {tenantPayments.length > 0 ? (
            <div className="space-y-4">

                {tenantPayments.map((payment) => (

                <div
                    key={payment.id}
                    className="border rounded-lg p-4"
                >
                    <p>
                    📅 {payment.month}
                    </p>

                    <p className="mt-2">
                    💰 {Number(
                        payment.amount
                    ).toLocaleString()}
                    {" "}
                    FCFA
                    </p>

                    <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full ${
                        payment.status === "Payé"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    >
                    {payment.status}
                    </span>

                </div>

                ))}

            </div>
            ) : (
            <p>
                Aucun paiement enregistré.
            </p>
            )}

      </div>

    </Layout>
  );
}