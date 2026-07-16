import { useContext } from "react";
import Layout from "../Layout";
import { RentsContext } from "../../context/RentsContext";
import { Link } from "react-router-dom";

export default function Rents() {

  const { rents, loading } = useContext(RentsContext);

  if (loading) {
    return (
      <Layout>
        <h2>Chargement des loyers...</h2>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Échéances de loyers</h1>
          <p className="text-slate-600 mt-2">
            Suivi des loyers générés automatiquement par les contrats
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3">Locataire</th>
                <th className="text-left px-4 py-3">Contrat</th>
                <th className="text-left px-4 py-3">Mois</th>
                <th className="text-left px-4 py-3">Échéance</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {rents.map((rent) => (
                <tr key={rent.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    {rent.tenant_name}
                  </td>

                  <td className="px-4 py-3">
                    {rent.contract_number}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(rent.due_month).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric"
                    })}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(rent.due_date).toLocaleDateString("fr-FR")}
                  </td>

                  <td className="text-right px-4 py-3 font-semibold">
                    {Number(rent.amount).toLocaleString()} FCFA
                  </td>

                  
                    <td className="px-4 py-3">

                        <span
                            className={`
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-semibold

                                ${
                                    rent.status === "Payé"
                                        ? "bg-green-100 text-green-700"

                                    : rent.status === "En attente"
                                        ? "bg-yellow-100 text-yellow-700"

                                    : "bg-red-100 text-red-700"
                                }
                            `}
                        >
                            {rent.status}
                        </span>

                    </td>

                    <td className="px-4 py-3">

                        {

                            rent.status === "Payé"

                            ? (

                                rent.receipt_path && (

                                    <a

                                        href={`http://localhost:5000${rent.receipt_path}`}

                                        target="_blank"

                                        rel="noreferrer"

                                        className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"

                                    >

                                        📄 Quittance

                                    </a>

                                )

                            )

                            : (

                                <Link

                                    to={`/admin/payments?rent=${rent.id}`}

                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"

                                >

                                    💳 Encaisser

                                </Link>

                            )

                        }

                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </Layout>
  );
}