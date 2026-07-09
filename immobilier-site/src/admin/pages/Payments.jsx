import { useContext, useState } from "react";

import Layout from "../Layout";

import { TenantsContext } from "../../context/TenantsContext";
import { PaymentsContext } from "../../context/PaymentsContext";

export default function Payments() {
  const { tenants } =
    useContext(TenantsContext);

  const {
    payments,
    setPayments,
  } = useContext(PaymentsContext);

  const [tenantId, setTenantId] =
    useState("");

  const [month, setMonth] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [status, setStatus] =
    useState("Payé");

  const addPayment = (e) => {
    e.preventDefault();

    const payment = {
      id: Date.now(),
      tenantId,
      month,
      amount,
      status,
    };

    setPayments([
      ...payments,
      payment,
    ]);

    setTenantId("");
    setMonth("");
    setAmount("");
    setStatus("Payé");
  };

  return (
    <Layout>

      <h1 className="text-4xl font-bold mb-8">
        Gestion des Paiements
      </h1>

      <form
        onSubmit={addPayment}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >

        <select
          value={tenantId}
          onChange={(e) =>
            setTenantId(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        >
          <option value="">
            Choisir locataire
          </option>

          {tenants.map((tenant) => (
            <option
              key={tenant.id}
              value={tenant.id}
            >
              {tenant.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Mois (Juin 2026)"
          value={month}
          onChange={(e) =>
            setMonth(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        >
          <option value="Payé">
            Payé
          </option>

          <option value="Impayé">
            Impayé
          </option>
        </select>

        <button
          className="bg-yellow-600 text-white px-6 py-3 rounded"
        >
          Enregistrer
        </button>

      </form>

      <div className="grid md:grid-cols-3 gap-6">

        {payments.map((payment) => {

          const tenant =
            tenants.find(
              (t) =>
                t.id ==
                payment.tenantId
            );

          return (
            <div
              key={payment.id}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h2 className="text-2xl font-bold">
                {tenant?.name}
              </h2>

              <p className="mt-2">
                📅 {payment.month}
              </p>

              <p className="mt-2">
                💰 {payment.amount} FCFA
              </p>

              <span
                className={`inline-block mt-4 px-3 py-1 rounded-full ${
                  payment.status === "Payé"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {payment.status}
              </span>

            </div>
          );
        })}

      </div>

    </Layout>
  );
}