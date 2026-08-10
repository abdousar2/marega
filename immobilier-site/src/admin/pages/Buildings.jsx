import { useContext, useMemo, useState } from "react";

import Layout from "../Layout";

import {
    PageHeader,
    StatsCard,
    SearchBar,
    Modal,
    Badge,
    Button,
    Empty
} from "../../components/ui";

import { BuildingsContext } from "../../context/BuildingsContext";
import { ApartmentsContext } from "../../context/ApartmentsContext";

import BuildingsService from "../../services/buildings.service";

export default function Buildings() {

    const {
        buildings,
        loading,
        reloadBuildings
    } = useContext(BuildingsContext);

    console.table(buildings);

    const {
        apartments
    } = useContext(ApartmentsContext);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState("");

    const [address, setAddress] = useState("");

    const [floors, setFloors] = useState("");

    const [status, setStatus] = useState("");

    const [deliveryDate, setDeliveryDate] = useState("");

    const filteredBuildings = useMemo(() => {

        return buildings.filter((building) => {

            return (

                (building.name || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                (building.address || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())

            );

        });

    }, [buildings, search]);

    if (loading) {

        return (

            <Layout>

                <div className="flex justify-center items-center h-96">

                    <div className="text-xl font-semibold">

                        Chargement des immeubles...

                    </div>

                </div>

            </Layout>

        );

    }

    function resetForm() {

        setEditingId(null);

        setName("");

        setAddress("");

        setFloors("");

        setStatus("");

        setDeliveryDate("");

    }

    async function addBuilding(e) {

        e.preventDefault();

        try {

            const payload = {

                name,

                address,

                floors,

                status,

                deliveryDate,

                description: "",

                city: "",

                country: "",

                apartments_count: 0

            };

            if (editingId) {

                await BuildingsService.update(editingId, payload);

            }

            else {

                await BuildingsService.create(payload);

            }

            await reloadBuildings();

            resetForm();

            setShowModal(false);

        }

        catch (err) {

            console.error(err);

            alert("Erreur lors de l'enregistrement.");

        }

    }

    function editBuilding(building) {

        setEditingId(building.id);

        setName(building.name || "");

        setAddress(building.address || "");

        setFloors(building.floors || "");

        setStatus(building.status || "");

        setDeliveryDate(building.deliveryDate || "");

        setShowModal(true);

    }

    async function deleteBuilding(id) {

        const hasApartments = apartments.some(

            apartment =>

                (apartment.buildingId || apartment.building_id) == id

        );

        if (hasApartments) {

            alert("Impossible de supprimer un immeuble contenant des appartements.");

            return;

        }

        if (!window.confirm("Supprimer cet immeuble ?"))

            return;

        try {

            await BuildingsService.remove(id);

            await reloadBuildings();

        }

        catch (err) {

            console.error(err);

            alert("Impossible de supprimer.");

        }

    }

    return (

        <Layout>

            <div className="space-y-8">

                <PageHeader

                    title="Gestion des immeubles"

                    subtitle="Ajoutez, modifiez et gérez votre patrimoine immobilier."

                    buttonLabel="+ Nouvel immeuble"

                    onButtonClick={() => {

                        resetForm();

                        setShowModal(true);

                    }}

                />

                <br></br>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <StatsCard

                        title="Immeubles"

                        value={buildings.length}

                        color="blue"

                        icon="🏢"

                    />

                    <StatsCard

                        title="Livrés"

                        value={

                            buildings.filter(

                                b => b.status === "Livré"

                            ).length

                        }

                        color="green"

                        icon="✅"

                    />

                    <StatsCard

                        title="En construction"

                        value={

                            buildings.filter(

                                b => b.status === "En construction"

                            ).length

                        }

                        color="orange"

                        icon="🏗️"

                    />

                </div>

                <div className="flex justify-between items-center mb-8">
                    <br></br><br></br><br></br>

                    <SearchBar

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                        placeholder="Rechercher un immeuble..."

                    />

                    <div className="text-slate-500">

                        {filteredBuildings.length} résultat(s)

                    </div>

                </div>


               {
                    filteredBuildings.length === 0 ? (

                        <Empty
                            title="Aucun immeuble"
                            subtitle="Commencez par créer votre premier immeuble."
                        />

                    ) : (

                        <div className="space-y-8">

                            {filteredBuildings.map((building) => {

                                const nbApartments = apartments.filter(

                                    (a) =>
                                        (a.buildingId || a.building_id) == building.id

                                ).length;

                                return (

                                    <div
                                        key={building.id}
                                        className="
                                            bg-white
                                            border
                                            border-slate-200
                                            shadow-sm
                                            hover:shadow-lg
                                            transition
                                            p-8
                                        "
                                    >

                                        <div className="flex justify-between items-start">

                                            <div>

                                                <h2 className="text-2xl font-bold text-slate-800">

                                                    🏢 {building.name}

                                                </h2>

                                                <p className="text-slate-500 mt-2">

                                                    📍 {building.address}
                                                    <br></br><br></br>

                                                </p>

                                            </div>                                           

                                            <Badge

                                                color={
                                                    building.status === "Livré"
                                                        ? "green"
                                                        : building.status === "En construction"
                                                        ? "orange"
                                                        : building.status === "Rénovation"
                                                        ? "blue"
                                                        : "red"
                                                }

                                            >

                                                {building.status}

                                            </Badge>

                                        </div>

                                        <div className="mt-8 grid grid-cols-3 gap-8">

                                            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">

                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    Étages
                                                </p>

                                                <p className="text-3xl font-bold mt-2">
                                                    {building.floors || "-"}
                                                </p>

                                            </div>

                                            

                                            <div>

                                                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">

                                                        Appartements

                                                    </p>

                                               <p className="text-3xl font-bold mt-2">

                                                    {nbApartments}

                                                </p>

                                                </div>

                                            </div>

                                            <div>

                                                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">

                                                <p className="text-xs uppercase tracking-wide text-slate-500">

                                                    Mise en exploitation

                                                </p>

                                                <p className="text-3xl font-bold mt-2">

                                                    {
                                                        building.delivery_date
                                                            ? new Date(building.delivery_date).toLocaleDateString("fr-FR")
                                                            : "-"
                                                    }

                                                </p>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="mt-8 pt-6 border-t flex justify-end gap-4">

                                            <Button
                                                color="blue"
                                                onClick={() => editBuilding(building)}
                                            >

                                                ✏️ Modifier

                                            </Button>

                                            <Button
                                                color="red"
                                                onClick={() => deleteBuilding(building.id)}
                                            >

                                                🗑️ Supprimer

                                            </Button>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )
                }

                <Modal
                    open={showModal}
                    title={
                        editingId
                            ? "Modifier un immeuble"
                            : "Nouvel immeuble"
                    }
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                >

                    <form
                        onSubmit={addBuilding}
                        className="space-y-6"
                    >

                        <input
                            type="text"
                            placeholder="Nom de l'immeuble"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="
                            w-full
                            border
                            border-slate-300
                            px-4
                            py-3
                            focus:ring-2
                            focus:ring-blue-500
                            outline-none
                            "
                            required
                        />

                        <input
                            type="text"
                            placeholder="Adresse"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="
                            w-full
                            border
                            border-slate-300
                            px-4
                            py-3
                            focus:ring-2
                            focus:ring-blue-500
                            outline-none
                            "
                            required
                        />
                        

                    <select
                        value={floors}
                        onChange={(e) => setFloors(e.target.value)}
                        className="
                                    w-full
                                    border
                                    border-slate-300
                                    px-4
                                    py-3
                                    focus:ring-2
                                    focus:ring-blue-500
                                    outline-none
                                    "
                    >
                        <option value="">
                            Nombre d'étages
                        </option>

                        <option value="Rez-de-chaussée">
                            Rez-de-chaussée
                        </option>

                        <option value="1er étage">
                            R + 1
                        </option>

                        <option value="2ème étage">
                            R + 2
                        </option>

                        <option value="3ème étage">
                            R + 3
                        </option>

                        <option value="4ème étage">
                            R + 4
                        </option>

                        <option value="5ème étage">
                            R + 5
                        </option>

                        <option value="6ème étage">
                            R + 6
                        </option>

                        <option value="7ème étage">
                            R + 7
                        </option>

                        <option value="8ème étage">
                            R + 8
                        </option>

                        <option value="9ème étage">
                            R + 9
                        </option>

                        <option value="10ème étage">
                            R + 10
                        </option>
                    </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="
                            w-full
                            border
                            border-slate-300
                            px-4
                            py-3
                            focus:ring-2
                            focus:ring-blue-500
                            outline-none
                            "
                        >

                            <option value="">
                                Choisir un statut
                            </option>

                            <option value="En construction">
                                🚧 En construction
                            </option>

                            <option value="Livré">
                                ✅ Livré
                            </option>

                            <option value="Rénovation">
                                🔨 Rénovation
                            </option>

                            <option value="Fermé">
                                🔒 Fermé
                            </option>

                        </select>

                        <div>

                            <label className="block mb-2 font-medium">
                                Date de mise en exploitation
                            </label>

                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="
                                w-full
                                border
                                border-slate-300
                                px-4
                                py-3
                                focus:ring-2
                                focus:ring-blue-500
                                outline-none
                                "
                            />

                        </div>

                        <div className="flex justify-end gap-3 pt-4">

                            <Button
                                color="gray"
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                Annuler
                            </Button>

                            <Button
                                color="blue"
                                type="submit"
                            >
                                {
                                    editingId
                                        ? "Enregistrer"
                                        : "Créer"
                                }
                            </Button>

                        </div>

                    </form>

                </Modal>

            </div>

        </Layout>

    );

}