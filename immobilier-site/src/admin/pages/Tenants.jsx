import { useContext, useState } from "react";
import Layout from "../Layout";

import { ApartmentsContext } from "../../context/ApartmentsContext";
import { TenantsContext } from "../../context/TenantsContext";
import { BuildingsContext } from "../../context/BuildingsContext";
import TenantsService from "../../services/tenants.service";

export default function Tenants() {
  const { apartments } =
    useContext(ApartmentsContext);

  const { buildings } =
    useContext(BuildingsContext);

  const {
    tenants,
    loading,
    reloadTenants,
  } = useContext(TenantsContext);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] = useState("");

  const [profession, setProfession] =
    useState("");

  const [entryDate, setEntryDate] =
    useState("");

  const [deposit, setDeposit] =
    useState("");

  const [status, setStatus] =
    useState("Actif");

  const [apartmentId, setApartmentId] =
    useState("");

  const [showFormer, setShowFormer] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

    if (loading) {
      return (
        <Layout>
          <h2>Chargement des locataires...</h2>
        </Layout>
      );
    }

    const addTenant = async (e) => {

      e.preventDefault();

      if (!apartmentId) {
        alert("Choisissez un appartement.");
        return;
      }

      try {

        const tenant = {

          apartment_id: Number(apartmentId),

          first_name: name,

          last_name: "",

          phone,

          email,

          id_type: "",

          id_number: "",

          profession,

          employer: "",

          emergency_contact: "",

          emergency_phone: "",

          entry_date: entryDate,

          exit_date: null,

          deposit: Number(deposit),

          status,

          notes: ""

        };

        if (editingId) {

          await TenantsService.update(
            editingId,
            tenant
          );

        } else {

          await TenantsService.create(
            tenant
          );

        }

        await reloadTenants();

        setEditingId(null);

        setName("");
        setPhone("");
        setEmail("");
        setProfession("");
        setEntryDate("");
        setDeposit("");
        setStatus("Actif");
        setApartmentId("");

      } catch (err) {

        console.error(err);

        alert("Erreur lors de l'enregistrement.");

      }

    };       

    const activeTenants =
      tenants.filter(
        (t) => t.status === "Actif"
      );

    const formerTenants =
      tenants.filter(
        (t) => t.status === "Parti"
      );

   

  return (
    <Layout>

      <h1 className="text-4xl font-bold mb-8">
        Gestion des Locataires
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-2xl shadow p-6">

          <p className="text-slate-500">
            Total Locataires
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {tenants.length}
          </h2>

        </div>

        <div className="bg-green-50 rounded-2xl shadow p-6">

          <p className="text-green-700">
            Locataires Actifs
          </p>

          <h2 className="text-4xl font-bold mt-2 text-green-700">
            {activeTenants.length}
          </h2>

        </div>

        <div className="bg-red-50 rounded-2xl shadow p-6">

          <p className="text-red-700">
            Anciens Locataires
          </p>

          <h2 className="text-4xl font-bold mt-2 text-red-700">
            {formerTenants.length}
          </h2>

        </div>

      </div>

      <form
        onSubmit={addTenant}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >

        <input
          type="text"
          placeholder="Nom du locataire"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="text"
          placeholder="Téléphone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="email"
          placeholder="Email (facultatif)"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="text"
          placeholder="Profession"
          value={profession}
          onChange={(e) =>
            setProfession(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <label className="block mb-2 font-medium">
          Début de location
        </label>

        <input
          type="date"
          value={entryDate}
          onChange={(e) =>
            setEntryDate(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="number"
          placeholder="Caution versée"
          value={deposit}
          onChange={(e) =>
            setDeposit(e.target.value)
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
          <option value="Actif">
            Actif
          </option>

          <option value="Parti">
            Parti
          </option>
        </select>

        <select
          value={apartmentId}
          onChange={(e) =>
            setApartmentId(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        >
          <option value="">
            Choisir appartement
          </option>

          {apartments
            .filter((apartment) => {

              const activeTenant =
                tenants.find(
                  (tenant) =>
                    tenant.apartment_id ==
                      apartment.id &&
                    tenant.status === "Actif"
                );

              return (
                !activeTenant ||
                activeTenant.id === editingId
              );

            })
            .map((apartment) => (
            <option
              key={apartment.id}
              value={apartment.id}
            >
              {apartment.number}
            </option>
          ))}
        </select>

        <button
          className="bg-yellow-600 text-white px-6 py-3 rounded"
        >
          {
            editingId
              ? "Mettre à jour"
              : "Ajouter Locataire"
          }
        </button>

      </form>

      <div className="mb-6">

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={showFormer}
            onChange={() =>
              setShowFormer(
                !showFormer
              )
            }
          />

          Afficher les anciens locataires

        </label>

      </div>

      <div className="mb-6">

        <input
          type="text"
          placeholder="🔎 Rechercher un locataire..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            bg-white
            border
            p-4
            rounded-xl
            shadow-sm
          "
        />

      </div>

      <div className="flex gap-3 mb-6">

        <button
          onClick={() =>
            setFilter("all")
          }
          className={`px-5 py-2 rounded-full ${
            filter === "all"
              ? "bg-slate-900 text-white"
              : "bg-white"
          }`}
        >
          Tous ({tenants.length})
        </button>

        <button
          onClick={() =>
            setFilter("active")
          }
          className={`px-5 py-2 rounded-full ${
            filter === "active"
              ? "bg-green-600 text-white"
              : "bg-white"
          }`}
        >
          Actifs ({activeTenants.length})
        </button>

        <button
          onClick={() =>
            setFilter("former")
          }
          className={`px-5 py-2 rounded-full ${
            filter === "former"
              ? "bg-red-600 text-white"
              : "bg-white"
          }`}
        >
          Partis ({formerTenants.length})
        </button>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {tenants
          .filter((tenant) => {

            if (filter === "active") {
              return tenant.status === "Actif";
            }

            if (filter === "former") {
              return tenant.status === "Parti";
            }

            return true;
          })
          .filter((tenant) => {

              const fullname =
                  `${tenant.first_name} ${tenant.last_name}`
                      .toLowerCase();

              return fullname.includes(
                  search.toLowerCase()
              );

          })
          .map((tenant) => {

          const apartment =
            apartments.find(
              (a) =>
                a.id ==
                tenant.apartment_id
            );

            const building =
              buildings.find(
                (b) =>
                  b.id ==
                  apartment?.building_id
              );

              const deleteTenant = async (id) => {

                if (!window.confirm("Supprimer ce locataire ?"))
                  return;

                try {

                  await TenantsService.remove(id);

                  await reloadTenants();

                } catch (err) {

                  console.error(err);

                  alert("Impossible de supprimer ce locataire.");

                }

              };

              const editTenant = (tenant) => {

                setName(
                  `${tenant.first_name} ${tenant.last_name ?? ""}`.trim()
                );

                setPhone(tenant.phone || "");

                setEmail(tenant.email || "");

                setProfession(tenant.profession || "");

                setEntryDate(tenant.entry_date || "");

                setDeposit(tenant.deposit || "");

                setStatus(tenant.status);

                setApartmentId(tenant.apartment_id);

                setEditingId(tenant.id);
              };

          return (
            <div
              key={tenant.id}
              className="
              bg-white
              rounded-3xl
              shadow-lg
              hover:shadow-2xl
              transition
              duration-300
              p-6
              border
              border-slate-100
              "
            >
              <div className="flex items-center gap-4 mb-4">

                <div
                  className="
                    w-14 h-14
                    rounded-full
                    bg-yellow-600
                    text-white
                    flex items-center
                    justify-center
                    text-xl
                    font-bold
                  "
                >
                  {tenant.first_name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {tenant.first_name} {tenant.last_name}
                  </h2>

                  <p className="text-slate-500 text-sm">
                    {tenant.profession}
                  </p>
                </div>

              </div>

              <p className="mt-2">
                📞 {tenant.phone}
              </p>

              {tenant.email && (
                <p className="mt-1">
                  📧 {tenant.email}
                </p>
              )}

              <p className="mt-1">
                💼 {tenant.profession}
              </p>

              <p className="mt-1">
                📅 Entrée : {tenant.entry_date}
              </p>

              <p className="mt-1">
                💰 Caution : {tenant.deposit} FCFA
              </p>

              <p className="mt-3 text-slate-500">
                🏢 {building?.name}
              </p>

              <p className="mt-1 text-slate-500">
                🚪 Appartement {apartment?.number}
              </p>

              <div
                className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-medium ${
                  tenant.status === "Actif"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {tenant.status === "Actif"
                  ? "🟢 Actif"
                  : "🔴 Parti"}
              </div>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() =>
                    editTenant(tenant)
                  }
                  className="bg-blue-600 text-white px-3 py-2 rounded"
                >
                  ✏️ Modifier
                </button>

                <button
                  onClick={() =>
                    deleteTenant(tenant.id)
                  }
                  className="bg-red-700 text-white px-3 py-2 rounded"
                >
                  🗑️ Supprimer
                </button>

              </div>

              {tenant.status === "Actif" && (
                <button
                  onClick={async () => {

                    try {

                      await TenantsService.update(tenant.id, {

                        apartment_id: tenant.apartment_id,

                        first_name: tenant.first_name,

                        last_name: tenant.last_name,

                        phone: tenant.phone,

                        email: tenant.email,

                        id_type: tenant.id_type,

                        id_number: tenant.id_number,

                        profession: tenant.profession,

                        employer: tenant.employer,

                        emergency_contact: tenant.emergency_contact,

                        emergency_phone: tenant.emergency_phone,

                        entry_date: tenant.entry_date,

                        exit_date: new Date().toISOString().slice(0,10),

                        deposit: tenant.deposit,

                        status: "Parti",

                        notes: tenant.notes

                      });

                      await reloadTenants();

                    }

                    catch(err){

                      console.error(err);

                      alert("Impossible de clôturer ce bail.");

                    }

                  }}

                  className="
                    block
                    mt-4
                    w-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-2
                    rounded-xl
                    transition
                  "
                >
                  Marquer comme parti
                </button>
              )}

            </div>
          );
        })}

      </div>

    </Layout>
  );
}