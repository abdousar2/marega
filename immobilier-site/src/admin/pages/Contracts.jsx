import { useContext, useMemo, useState } from "react";
import Layout from "../Layout";


import {
    PageHeader,
    StatsCard,
    SearchBar,
    Modal,
    Button,
    Badge,
Empty
} from "../../components/ui";

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

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const activeContracts = contracts.filter(
      c => c.status === "Actif"
  );

  const filteredContracts = useMemo(() => {

      return contracts.filter(contract => {

          const tenant = tenants.find(
              t => t.id == contract.tenant_id
          );

          const fullname =
              `${tenant?.first_name ?? ""} ${tenant?.last_name ?? ""}`
                  .toLowerCase();

          return fullname.includes(
              search.toLowerCase()
          );

      });

  }, [contracts, tenants, search]);

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
           

          await reloadContracts();

          setTenantId("");

          setStartDate("");

          setEndDate("");
          setShowModal(false);

      }

      catch(err){

          console.error(err);

          alert("Impossible de créer le contrat.");

      }
      

  };
  return (
    <Layout>

      <PageHeader
          title="Gestion des contrats"
          subtitle="Créez et gérez les contrats de location."
          buttonLabel="+ Nouveau contrat"
          onButtonClick={() => {

              setTenantId("");
              setStartDate("");
              setEndDate("");

              setShowModal(true);

          }}
      />
      <br></br>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <StatsCard
              title="Contrats"
              value={contracts.length}
              color="blue"
          />

          <StatsCard
              title="Contrats actifs"
              value={activeContracts.length}
              color="green"
          />

          <StatsCard
              title="Contrats terminés"
              value={contracts.length - activeContracts.length}
              color="orange"
          />

      </div>
      <br></br>

      <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un locataire..."
      />
      <br></br><br></br>

      <Modal
          open={showModal}
          title="Nouveau contrat"
          onClose={() => setShowModal(false)}
      >

          <form
              onSubmit={addContract}
              className="space-y-5"
          >

          <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="border p-3 w-full rounded-xl"
          >
              <option value="">
                  Choisir un locataire
              </option>

              {tenants
                  .filter(t => t.status === "Actif")
                  .map(tenant => (
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
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-3 w-full rounded-xl"
          />

          <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-3 w-full rounded-xl"
          />

      <div className="flex justify-end gap-3 pt-4">

          <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
          >
              Annuler
          </Button>

          <Button
              type="submit"
              variant="primary"
          >
              Créer
          </Button>

      </div>

      </form>

      </Modal>


      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

          {filteredContracts.length === 0 ? (

              <Empty
                  title="Aucun contrat"
                  subtitle="Aucun contrat ne correspond à votre recherche."
              />

          ) : (

              filteredContracts.map((contract) => {

                  const tenant = tenants.find(
                      t => t.id == contract.tenant_id
                  );

                  const apartment = apartments.find(
                      a => a.id == contract.apartment_id
                  );

                  return (

                      <div
                          key={contract.id}
                          className="
                              bg-white
                              rounded-3xl
                              border
                              border-slate-200
                              shadow-sm
                              hover:shadow-xl
                              transition
                              p-7
                          "
                      >

                          <div className="flex justify-between items-start">

                              <div>

                                  <p className="text-slate-500 text-sm">
                                      Contrat
                                  </p>

                                  <h2 className="text-2xl font-bold mt-1">
                                      {contract.contract_number}
                                  </h2>

                              </div>

                              <Badge
                                  color={
                                      contract.status === "Actif"
                                          ? "green"
                                          : "red"
                                  }
                              >
                                  {contract.status}
                              </Badge>

                          </div>

                          <div className="mt-6 space-y-3">

                              <p>
                                  👤 <strong>{tenant?.first_name} {tenant?.last_name}</strong>
                              </p>

                              <p>
                                  🏠 Appartement <strong>{apartment?.number}</strong>
                              </p>

                              <p>
                                  📅 Début : {contract.start_date}
                              </p>

                              <p>
                                  📅 Fin : {contract.end_date}
                              </p>

                          </div>

                          <div className="mt-6 grid grid-cols-2 gap-4">

                              <div className="bg-slate-50 rounded-2xl p-4">

                                  <div className="text-slate-500 text-sm">
                                      Loyer
                                  </div>

                                  <div className="text-xl font-bold text-green-700 mt-2">
                                      {Number(contract.monthly_rent).toLocaleString()} FCFA
                                  </div>

                              </div>

                              <div className="bg-slate-50 rounded-2xl p-4">

                                  <div className="text-slate-500 text-sm">
                                      Caution
                                  </div>

                                  <div className="text-xl font-bold mt-2">
                                      {Number(contract.deposit).toLocaleString()} FCFA
                                  </div>

                              </div>

                          </div>

                          <div className="flex gap-2 mt-6">

                              {contract.pdf_path && (

                                  <Button
                                      variant="primary"
                                      onClick={() =>
                                          window.open(
                                              `http://localhost:5000${contract.pdf_path}`,
                                              "_blank"
                                          )
                                      }
                                  >
                                      📄 Contrat PDF
                                  </Button>

                              )}

                          </div>

                      </div>

                  );

              })

          )}

      </div>

    </Layout>
  );
}