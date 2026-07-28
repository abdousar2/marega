import { useContext, useState } from "react";
import Layout from "../Layout";

import {
    PageHeader,
    StatsCard,
    SearchBar,
    Table,
    Modal,
    Badge,
    Button,
} from "../../components/ui";

import {
  BuildingsContext,
} from "../../context/BuildingsContext";

import {
  ApartmentsContext,
} from "../../context/ApartmentsContext";

import { TenantsContext } from "../../context/TenantsContext";
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

  const [showModal, setShowModal] = useState(false);

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

          alert("Impossible de supprimer un appartement occupé.");

      }

  };
          

  return (
    <Layout>
      

      <PageHeader
          title="Gestion des appartements"
          subtitle="Consultez, ajoutez et gérez tous les appartements."
          buttonLabel="+ Nouvel appartement"
          onButtonClick={() => {

            setEditingId(null);

            setBuildingId("");

            setNumber("");

            setType("");

            setSurface("");

            setRent("");

            setDeposit("");

            setShowModal(true);

        }}
      />   
      <br></br>

      

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
      <br></br>     

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <StatsCard
              title="Appartements"
              value={apartments.length}
              color="blue"
          />

          <StatsCard
              title="Disponibles"
              value={availableApartments.length}
              color="green"
          />

          <StatsCard
              title="Occupés"
              value={occupiedApartments.length}
              color="red"
          />

      </div>   
      <br></br> 

      <div className="flex justify-between items-start mb-8">
        <br></br>

        <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un appartement..."
        />
        

      </div>    
          <br></br>
          

      <Table
          headers={[
              "Appartement",
              "Immeuble",
              "Type",
              "Surface",
              "Loyer",
              "Statut",
              "Actions"
          ]}
      >

      {
      apartments

      .filter((apartment) => {

          const occupied =
              tenants.some(

                  tenant =>

                      tenant.apartmentId == apartment.id &&

                      tenant.status === "Actif"

              );

          if (statusFilter === "available" && occupied)

              return false;

          if (statusFilter === "occupied" && !occupied)

              return false;

          return true;

      })

      .filter((apartment) => {

          const query = search.toLowerCase();

          return (

              apartment.number.toLowerCase().includes(query) ||

              apartment.type.toLowerCase().includes(query)

          );

      })

      .map(apartment => {

          const building =

              buildings.find(

                  b => b.id == apartment.building_id

              );

          const activeTenant =

              tenants.find(

                  t =>

                      t.apartmentId == apartment.id &&

                      t.status === "Actif"

              );

          return (

      <tr key={apartment.id}>

      <td className="px-8 py-14 font-semibold ">

          {apartment.number}

      </td>

      <td className="px-6 py-4">

          {building?.name}

      </td>

      <td className="px-6 py-4">

          {apartment.type}

      </td>

      <td className="px-6 py-4">

          {apartment.surface} m²

      </td>

      <td className="px-6 py-4">

          {Number(apartment.rent).toLocaleString()} FCFA

      </td>

      <td className="px-6 py-4">

      <Badge

      color={

      activeTenant

      ? "red"

      : "green"

      }

      >

      {

      activeTenant

      ?

      "Occupé"

      :

      "Disponible"

      }

      </Badge>

      </td>

      <td className="px-6 py-4">

      <div className="flex gap-2">

      <Button

      variant="primary"

     onClick={() => {

          editApartment(apartment);

          setShowModal(true);

      }}

      >

      ✏️

      </Button>

      <Button

      variant="danger"

      onClick={() =>

      deleteApartment(apartment.id)

      }

      >

      🗑️

      </Button>

      </div>

      </td>

      </tr>

          );

      })

      }

      </Table>

      <Modal

          open={showModal}

          title={editingId ? "Modifier un appartement" : "Nouvel appartement"}

          onClose={() => {

              setShowModal(false);

              setEditingId(null);

          }}

      >

      <form
          onSubmit={addApartment}
          className="space-y-5"
      >

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
              <br></br>

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
          <br></br>

          <div className="flex justify-end gap-3 pt-5">

              <Button
                  color="red"
                  variant="secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
              >
                  Annuler
              </Button>

              <Button              
                  variant="primary"
                  type="submit"
              >
                  {editingId ? "Enregistrer" : "Créer"}
              </Button>

          </div>
          <br></br>

      </form>

      </Modal>

      

    </Layout>
  );
}