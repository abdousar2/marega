import { useContext, useState } from "react";
import Layout from "../Layout";

import {
  BuildingsContext,
} from "../../context/BuildingsContext";

import {
  ApartmentsContext,
} from "../../context/ApartmentsContext";

import { TenantsContext } from "../../context/TenantsContext";
import { Link } from "react-router-dom";
import ApartmentsService from "../../services/apartments.service";

export default function Apartments() {
  const { buildings } =
    useContext(BuildingsContext);

  const {
      apartments,
      loading,
      reloadApartments,
  } = useContext(ApartmentsContext);

  const { tenants } =
    useContext(TenantsContext);

  const [search, setSearch] =
    useState("");

  const [buildingId, setBuildingId] =
    useState("");

  const [number, setNumber] =
    useState("");

  const [type, setType] =
    useState("");

  const [surface, setSurface] =
    useState("");

  const [rent, setRent] =
    useState("");

  const [deposit, setDeposit] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [statusFilter, setStatusFilter] =
    useState("all");
  
    if (loading) {

        return (

            <Layout>

                <h2>Chargement des appartements...</h2>

            </Layout>

        );

    }

  const occupiedApartments =
    apartments.filter((apartment) =>
      tenants.some(
        (tenant) =>
          tenant.apartmentId == apartment.id &&
          tenant.status === "Actif"
      )
    );

  const availableApartments =
    apartments.filter((apartment) =>
      !tenants.some(
        (tenant) =>
          tenant.apartmentId == apartment.id &&
          tenant.status === "Actif"
      )
    );

  const addApartment = async (e) => {

    e.preventDefault();

    if (!buildingId) {

        alert("Veuillez choisir un immeuble.");

        return;

    }

    try {

        const apartment = {

              building_id: Number(buildingId),

              number,

              floor: "",

              type,

              surface: Number(surface),

              rent: Number(rent),

              charges: 0,

              deposit: Number(deposit),

              status: "Disponible",

              description: ""

          };

          if (editingId) {

              await ApartmentsService.update(
                  editingId,
                  apartment
              );

          }

          else {

              await ApartmentsService.create(
                  apartment
              );

          }

          await reloadApartments();

          setEditingId(null);

          setBuildingId("");
          setNumber("");
          setType("");
          setSurface("");
          setRent("");
          setDeposit("");

      }

      catch (err) {

          console.error(err);

          alert("Erreur lors de l'enregistrement.");

      }

  };

  const editApartment = (apartment) => {

      setEditingId(apartment.id);

      setBuildingId(apartment.building_id);

      setNumber(apartment.number);

      setType(apartment.type);

      setSurface(apartment.surface);

      setRent(apartment.rent);

      setDeposit(apartment.deposit);

  };

  const deleteApartment = async (id) => {

      const occupied = tenants.some(

          tenant =>
              tenant.apartmentId == id &&
              tenant.status === "Actif"

      );

      if (occupied) {

          alert("Impossible de supprimer un appartement occupé.");

          return;

      }

      if (!window.confirm("Supprimer cet appartement ?"))
          return;

      try {

          await ApartmentsService.remove(id);

          await reloadApartments();

      }

      catch (err) {

          console.error(err);

          alert("Impossible de supprimer.");

      }

  };
          

  return (
    <Layout>
      

      <h1 className="text-4xl font-bold mb-8">
        Gestion des Appartements
      </h1>      

      <div className="mb-8">

        <input
          type="text"
          placeholder="🔎 Rechercher un appartement..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            bg-white
            border
            p-4
            rounded-2xl
            shadow-sm
          "
        />

      </div>      

      <div className="flex flex-wrap gap-3 mb-8">

        <button
          onClick={() =>
            setStatusFilter("all")
          }
          className={`px-5 py-2 rounded-full ${
            statusFilter === "all"
              ? "bg-slate-900 text-white"
              : "bg-white"
          }`}
        >
          Tous
        </button>

        <button
          onClick={() =>
            setStatusFilter("available")
          }
          className={`px-5 py-2 rounded-full ${
            statusFilter === "available"
              ? "bg-green-600 text-white"
              : "bg-white"
          }`}
        >
          Disponibles
        </button>

        <button
          onClick={() =>
            setStatusFilter("occupied")
          }
          className={`px-5 py-2 rounded-full ${
            statusFilter === "occupied"
              ? "bg-red-600 text-white"
              : "bg-white"
          }`}
        >
          Occupés
        </button>

      </div>      

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-slate-500">
            Total
          </p>

          <h2 className="text-4xl font-bold">
            {apartments.length}
          </h2>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl shadow">
          <p className="text-green-700">
            Disponibles
          </p>

          <h2 className="text-4xl font-bold text-green-700">
            {availableApartments.length}
          </h2>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl shadow">
          <p className="text-red-700">
            Occupés
          </p>

          <h2 className="text-4xl font-bold text-red-700">
            {occupiedApartments.length}
          </h2>
        </div>

      </div>
      
      <form
        onSubmit={addApartment}
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-8
          mb-8
        "
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <select
          value={buildingId}
          onChange={(e) =>
            setBuildingId(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        >
          <option value="">
            Choisir un immeuble
          </option>

          {buildings.map((building) => (
            <option
              key={building.id}
              value={building.id}
            >
              {building.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Numéro appartement"          
          value={number}
          onChange={(e) =>
            setNumber(e.target.value)
          }
          className="border p-3 w-full mb-4 rounded"
        />

        <input
            type="text"
            placeholder="Type (Studio, F2, F3...)"
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="border p-3 w-full mb-4 rounded"
          />

          <input
            type="number"
            placeholder="Surface en m²"
            value={surface}
            onChange={(e) =>
              setSurface(e.target.value)
            }
            className="border p-3 w-full mb-4 rounded"
          />

          <input
            type="number"
            placeholder="Loyer mensuel"
            value={rent}
            onChange={(e) =>
              setRent(e.target.value)
            }
            className="border p-3 w-full mb-4 rounded"
          />

          <input
            type="number"
            placeholder="Montant caution"
            value={deposit}
            onChange={(e) =>
              setDeposit(e.target.value)
            }
            className="border p-3 w-full mb-4 rounded"
          />

          </div>

        <button
          className="
            mt-6
            bg-yellow-600
            hover:bg-yellow-700
            text-white
            px-8
            py-3
            rounded-xl
            transition
            font-semibold
          "
        >
          {editingId
            ? "💾 Mettre à jour"
            : "➕ Ajouter Appartement"}
        </button>

      </form>      

      <div className="grid md:grid-cols-3 gap-6">

        {apartments

          .filter((apartment) => {

            const occupied =
              tenants.some(
                (tenant) =>
                  tenant.apartmentId == apartment.id &&
                  tenant.status === "Actif"
              );

            if (
              statusFilter === "available" &&
              occupied
            ) {
              return false;
            }

            if (
              statusFilter === "occupied" &&
              !occupied
            ) {
              return false;
            }

            return true;
          })

          .filter((apartment) => {

            const query =
              search.toLowerCase();

            return (
              (apartment.number || "")
                .toLowerCase()
                .includes(query) ||

              (apartment.type || "")
                .toLowerCase()
                .includes(query)
            );
          })

          .map((apartment) => {       

          const building =
            buildings.find(
              (b) =>
                b.id ==
                apartment.building_id
            );
            
            const activeTenant =
              tenants.find(
                (tenant) =>
                  tenant.apartmentId == apartment.id &&
                  tenant.status === "Actif"
              );

          return (
            <div
              key={apartment.id}
              className="
                bg-white
                rounded-3xl
                p-6
                border
                border-slate-100
                shadow-lg
                hover:shadow-2xl
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <Link
                to={`/admin/apartments/${apartment.id}`}
              >
                <div className="flex items-center gap-4 mb-4">

                  <div
                    className="
                      w-14 h-14
                      rounded-full
                      bg-yellow-600
                      text-white
                      flex
                      items-center
                      justify-center
                      font-bold
                      text-lg
                    "
                  >
                    🏠
                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-slate-800">
                      {apartment.number}
                    </h2>

                    <p className="text-slate-500">
                      {apartment.type}
                    </p>

                  </div>

                </div>
                
              </Link>

              <p className="mt-2 text-slate-500">
                🏢 {building?.name}
              </p>

              <div className="space-y-2 mt-4">

                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-semibold">
                    {apartment.type}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Surface</span>
                  <span className="font-semibold">
                    {apartment.surface} m²
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Loyer</span>
                  <span className="font-semibold text-green-700">
                    {Number(
                      apartment.rent
                    ).toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Caution</span>
                  <span className="font-semibold">
                    {Number(
                      apartment.deposit
                    ).toLocaleString()} FCFA
                  </span>
                </div>

              </div>
              <div
                className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-medium ${
                  activeTenant
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {activeTenant
                  ? "🔴 Occupé"
                  : "🟢 Disponible"}
              </div>

              {activeTenant && (
                <p className="mt-3 text-sm text-slate-600">
                  👤 Occupé par :
                  <span className="font-semibold ml-1">
                    {activeTenant.name}
                  </span>
                </p>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() =>
                    editApartment(apartment)
                  }
                  className="
                    flex-1
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    py-2
                    rounded-xl
                    transition
                  "
                >
                  ✏️ Modifier
                </button>

                <button
                  onClick={() =>
                    deleteApartment(apartment.id)
                  }
                  className="
                    flex-1
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-2
                    rounded-xl
                    transition
                  "
                >
                  🗑️ Supprimer
                </button>
              </div>       


            </div>
          );
        })}

      </div>

    </Layout>
  );
}