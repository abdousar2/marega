import { useContext, useState } from "react";
import Layout from "../Layout";
import { BuildingsContext } from "../../context/BuildingsContext";
import { ApartmentsContext } from "../../context/ApartmentsContext";
import BuildingsService from "../../services/buildings.service";


export default function Buildings() {
  const {
      buildings,
      loading,
      reloadBuildings
  } = useContext(BuildingsContext);
  

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [floors, setFloors] = useState("");
  const [status, setStatus] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { apartments } = useContext(ApartmentsContext);

  if (loading) {

    return (
      <Layout>
        <h2>Chargement des immeubles...</h2>
      </Layout>
    );

  }

  const addBuilding = async (e) => {

      e.preventDefault();

      try {

          if (editingId) {

              await BuildingsService.update(editingId, {
                  name,
                  address,
                  floors,
                  status,
                  description: "",
                  city: "",
                  country: "",
                  apartments_count: 0
              });

          } else {

              await BuildingsService.create({
                  name,
                  address,
                  floors,
                  status,
                  description: "",
                  city: "",
                  country: "",
                  apartments_count: 0
              });

          }

          await reloadBuildings();

          setEditingId(null);
          setName("");
          setAddress("");
          setFloors("");
          setStatus("");
          setDeliveryDate("");

      } catch (err) {

          console.error(err);
          alert("Erreur lors de l'enregistrement.");

      }

  };

  const editBuilding = (building) => {

    setEditingId(building.id);

    setName(building.name);

    setAddress(building.address);

    setFloors(building.floors);

    setStatus(building.status);

    setDeliveryDate(building.deliveryDate || "");
  };

  const deleteBuilding = async (id) => {

    const hasApartments =
      apartments.some(
        (a) => a.buildingId == id
      );

    if (hasApartments) {

      alert(
        "Impossible de supprimer un immeuble contenant des appartements."
      );

      return;
    }

    if (
      !window.confirm(
        "Supprimer cet immeuble ?"
      )
    )
      return;

    try {

        await BuildingsService.remove(id);

        await reloadBuildings();

    }

    catch (err) {

        console.error(err);

        alert("Impossible de supprimer.");

    }
  };
  
  return (
    <Layout>

      <div className="max-w-none">

      <h1 className="text-4xl font-bold mb-8">
        Gestion des Immeubles
      </h1>
      
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-8
        "
      >

        <div className="bg-white p-8 rounded-3xl shadow-lg min-h-[100px]">
          <p className="text-slate-500">
            Immeubles
          </p>

          <h2 className="text-4xl font-bold">
            {buildings.length}
          </h2>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl shadow">
          <p className="text-green-700">
            Livrés
          </p>

          <h2 className="text-4xl font-bold text-green-700">
            {
              buildings.filter(
                (b) =>
                  b.status === "Livré"
              ).length
            }
          </h2>
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl shadow">
          <p className="text-orange-700">
            En construction
          </p>

          <h2 className="text-4xl font-bold text-orange-700">
            {
              buildings.filter(
                (b) =>
                  b.status ===
                  "En construction"
              ).length
            }
          </h2>
        </div>

      </div>

      <p className="text-slate-500 mb-6">
        Créez et gérez vos immeubles,
        leur statut et leur date de mise
        en exploitation.
      </p>

      <form onSubmit={addBuilding} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-10">        
        
         
        <h2 className="text-3xl font-bold mb-6">
          {editingId
            ? "Modifier un immeuble"
            : "Nouvel immeuble"}
        </h2>

        <div className="grid md:grid-cols-1 gap-4">

        <input
          type="text"
          placeholder="Nom de l'immeuble"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
           className="border p-3 w-full mb-4 rounded bg-grey p-3 rounded-5xl shadow-1g min-h-[40px]"
        />

        <input
          type="text"
          placeholder="Adresse"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
            className="border p-3 w-full mb-4 rounded bg-grey p-3 rounded-5xl shadow-1g min-h-[40px]"

        />

        <input
          type="text"
          placeholder="Nombre d'étages (R+8)"
          value={floors}
          onChange={(e) => setFloors(e.target.value)}
          className="border p-3 w-full mb-4 rounded bg-grey p-3 rounded-5xl shadow-1g min-h-[40px]"

        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
           className="border p-3 w-full mb-4 rounded bg-grey p-3 rounded-5xl shadow-1g min-h-[40px]"

        >
          <option value="">
            Statut de l'immeuble
          </option>

          <option value="En construction">
            🚧 En construction
          </option>

          <option value="Livré">
            ✅ Livré
          </option>

          <option value="Rénovation">
            🔨 En rénovation
          </option>

          <option value="Fermé">
            🔒 Fermé
          </option>
        </select>

        <label className="block mb-2 font-medium">
          Date de mise en exploitation
        </label>

        <input
          type="date"
          value={deliveryDate}
          onChange={(e) =>
            setDeliveryDate(e.target.value)
          }
           className="border p-3 w-full mb-4 rounded bg-grey p-3 rounded-5xl shadow-1g min-h-[40px]"

        />

        </div>

        <button
          className="
            mt-8
            bg-yellow-600
            hover:bg-yellow-700
            text-white
            px-8
            py-4
            rounded-2xl
            font-semibold
            shadow-lg
            transition
          "
        >
          {editingId
            ? "💾 Mettre à jour"
            : "➕ Ajouter"}
        </button>

      </form>

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          2xl:grid-cols-3
          gap-8
          w-full
        "
      >

        {buildings.map((building) => (
          <div
            key={building.id}
            className="
              bg-white
              rounded-3xl
              overflow-hidden
              border
              border-slate-200
              shadow-lg
              hover:shadow-2xl
              hover:-translate-y-2
              transition-all
              duration-300
            "
          >
            <div
              className="
                h-32
                bg-gradient-to-r
                from-yellow-500
                via-orange-500
                to-red-500
                flex
                items-center
                justify-center
              "
            >
              <span className="text-5xl">
                🏢
              </span>
            </div>

            <div className="p-6">

              <h2 className="text-2xl font-bold text-slate-800">
                {building.name}
              </h2>

              <div className="space-y-3 mt-5">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Adresse
                  </span>

                  <span
                    className="
                      font-medium
                      text-right
                      max-w-[180px]
                      break-words
                    "
                  >
                    {building.address}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Étages
                  </span>

                  <span className="font-medium">
                    {building.floors}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Appartements
                  </span>

                  <span className="font-medium">
                    {
                      apartments.filter(
                        (a) =>
                          a.buildingId == building.id
                      ).length
                    }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Mise en exploitation
                  </span>

                  <span className="font-medium">
                    {building.deliveryDate}
                  </span>
                </div>

              </div>
              <span
                className={`inline-block mt-4 px-4 py-2 rounded-full text-sm font-semibold ${
                  building.status === "Livré"
                    ? "bg-green-100 text-green-700"
                    : building.status === "En construction"
                    ? "bg-orange-100 text-orange-700"
                    : building.status === "Rénovation"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {building.status}
              </span>

              <div className="flex gap-2 mt-5">

                <button
                  onClick={() =>
                    editBuilding(building)
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
                    deleteBuilding(building.id)
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
          </div>
        ))}

      </div>

      </div>

    </Layout>
  );
}