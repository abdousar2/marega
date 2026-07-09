import { useContext, useState } from "react";
import Layout from "../Layout";

import { TenantsContext } from "../../context/TenantsContext";
import { ApartmentsContext } from "../../context/ApartmentsContext";
import { ContractsContext } from "../../context/ContractsContext";
import LeasesService from "../../services/leases.service";

export default function Contracts() {

  const { tenants } =
    useContext(TenantsContext);

  const { apartments } =
    useContext(ApartmentsContext);

  const {
      contracts,
      loading,
      reloadContracts,
  } = useContext(ContractsContext);

  const [tenantId, setTenantId] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

    if (loading) {

        return (

            <Layout>

                <h2>Chargement des contrats...</h2>

            </Layout>

        );

    }

  const addContract = async (e) => {

      e.preventDefault();

      const tenant = tenants.find(
          t => t.id == tenantId
      );

      if (!tenant) {

          alert("Locataire introuvable.");

          return;

      }

      const apartment = apartments.find(
          a => a.id == tenant.apartment_id
      );

      if (!apartment) {

          alert("Appartement introuvable.");

          return;

      }

      try {

        console.log("Appartement sélectionné :", apartment);

        const payload = {

            tenant_id: tenant.id,

            apartment_id: apartment.id,

            contract_number: `CTR-${Date.now()}`,

            start_date: startDate,

            end_date: endDate,

            monthly_rent: apartment.rent,

            charges: apartment.charges,

            deposit: apartment.deposit,

            payment_day: 5,

            status: "Actif",

            notes: ""

        };

        console.log(payload);

await LeasesService.create(payload);

          await LeasesService.create({

              tenant_id: tenant.id,

              apartment_id: apartment.id,

              contract_number: `CTR-${Date.now()}`,

              start_date: startDate,

              end_date: endDate,

              monthly_rent: apartment.rent,

              charges: 0,

              deposit: apartment.deposit,

              payment_day: 5,

              status: "Actif",

              notes: ""

          });

          await reloadContracts();

          setTenantId("");

          setStartDate("");

          setEndDate("");

      }

      catch(err){

          console.error(err);

          alert("Impossible de créer le contrat.");

      }

  };

  return (
    <Layout>

      <h1 className="text-4xl font-bold mb-8">
        Contrats
      </h1>

      <form
        onSubmit={addContract}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >

        <select
          value={tenantId}
          onChange={(e) =>
            setTenantId(
              e.target.value
            )
          }
          className="border p-3 w-full mb-4 rounded"
        >

          <option value="">
            Choisir locataire
          </option>

          {tenants
            .filter(
              (tenant) =>
                tenant.status ===
                "Actif"
            )
            .map((tenant) => (
              <option
                key={tenant.id}
                value={tenant.id}
              >
                {tenant.first_name} {tenant.last_name}
              </option>
            ))}

        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(
              e.target.value
            )
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(
              e.target.value
            )
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <button
          className="bg-yellow-600 text-white px-6 py-3 rounded"
        >
          Créer Contrat
        </button>

      </form>

      <div className="grid md:grid-cols-3 gap-6">

        {contracts.map(
          (contract) => {

            const tenant =
              tenants.find(
                (t) =>
                  t.id ==
                  contract.tenant_id
              );

            const apartment =
              apartments.find(
                (a) =>
                  a.id ==
                  contract.apartment_id
              );

            return (
              <div
                key={contract.id}
                className="bg-white p-6 rounded-xl shadow"
              >

                <h2 className="text-xl font-bold">
                    Contrat #{contract.id}
                </h2>

                <p className="mt-3">
                  👤 {tenant?.first_name} {tenant?.last_name}
                </p>

                <p className="mt-2">
                  🏠 Appartement
                  {" "}
                  {apartment?.number}
                </p>

                <p className="mt-2">
                  📅
                  {" "}
                  {contract.start_date}
                </p>

                <p className="mt-2">
                  📅
                  {" "}
                  {contract.end_date}
                </p>

                <p className="mt-2">
                  💰
                  {" "}
                  {Number(
                    contract.monthly_rent
                  ).toLocaleString()}
                  FCFA
                </p>

                <p className="mt-2">
                  🔐
                  {" "}
                  {Number(
                    contract.deposit
                  ).toLocaleString()}
                  FCFA
                </p>

              </div>
            );
          }
        )}

      </div>

    </Layout>
  );
}