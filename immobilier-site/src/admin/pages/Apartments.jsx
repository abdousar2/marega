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

import "./Apartments.css";


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

    const [showModal, setShowModal] =
        useState(false);

    const [statusFilter, setStatusFilter] =
        useState("all");


    /* =========================================================
       CHARGEMENT
    ========================================================= */

    if (loading) {

        return (

            <Layout>

                <div className="apartments-loading">

                    Chargement des appartements...

                </div>

            </Layout>

        );

    }


    /* =========================================================
       OCCUPATION
    ========================================================= */

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


    /* =========================================================
       RÉINITIALISATION DU FORMULAIRE
    ========================================================= */

    const resetForm = () => {

        setEditingId(null);

        setBuildingId("");

        setNumber("");

        setType("");

        setSurface("");

        setRent("");

        setDeposit("");

    };


    /* =========================================================
       AJOUT / MODIFICATION
    ========================================================= */

    const addApartment = async (e) => {

        e.preventDefault();


        if (!buildingId) {

            alert(
                "Veuillez choisir un immeuble."
            );

            return;

        }


        try {

            const apartment = {

                building_id:
                    Number(buildingId),

                number,

                floor: "",

                type,

                surface:
                    Number(surface),

                rent:
                    Number(rent),

                charges: 0,

                deposit:
                    Number(deposit),

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

            resetForm();

            setShowModal(false);

        }

        catch (err) {

            console.error(err);

            alert(
                "Erreur lors de l'enregistrement."
            );

        }

    };


    /* =========================================================
       MODIFICATION
    ========================================================= */

    const editApartment = (apartment) => {

        setEditingId(apartment.id);

        setBuildingId(
            apartment.building_id
        );

        setNumber(
            apartment.number
        );

        setType(
            apartment.type
        );

        setSurface(
            apartment.surface
        );

        setRent(
            apartment.rent
        );

        setDeposit(
            apartment.deposit
        );

        setShowModal(true);

    };


    /* =========================================================
       SUPPRESSION
    ========================================================= */

    const deleteApartment = async (id) => {

        const occupied =
            tenants.some(

                tenant =>
                    tenant.apartmentId == id &&
                    tenant.status === "Actif"

            );


        if (occupied) {

            alert(
                "Impossible de supprimer un appartement occupé."
            );

            return;

        }


        if (
            !window.confirm(
                "Supprimer cet appartement ?"
            )
        ) {

            return;

        }


        try {

            await ApartmentsService.remove(id);

            await reloadApartments();

        }

        catch (err) {

            console.error(err);

            alert(
                "Impossible de supprimer l'appartement."
            );

        }

    };


    /* =========================================================
       OUVERTURE NOUVEL APPARTEMENT
    ========================================================= */

    const openCreateModal = () => {

        resetForm();

        setShowModal(true);

    };


    /* =========================================================
       FILTRAGE
    ========================================================= */

    const filteredApartments =
        apartments

            .filter((apartment) => {

                const occupied =
                    tenants.some(

                        tenant =>

                            tenant.apartmentId ==
                                apartment.id &&

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

                    String(
                        apartment.number || ""
                    )
                        .toLowerCase()
                        .includes(query)

                    ||

                    String(
                        apartment.type || ""
                    )
                        .toLowerCase()
                        .includes(query)

                );

            });


    return (

        <Layout>

            <div className="apartments-page">


                {/* =====================================================
                    HEADER
                ====================================================== */}

                <PageHeader

                    title="Gestion des appartements"

                    subtitle="Consultez, ajoutez et gérez tous les appartements."

                    buttonLabel="+ Nouvel appartement"

                    onButtonClick={
                        openCreateModal
                    }

                />


                {/* =====================================================
                    FILTRES DE STATUT
                ====================================================== */}

                <div className="apartment-status-filters">

                    <button

                        type="button"

                        onClick={() =>
                            setStatusFilter("all")
                        }

                        className={
                            statusFilter === "all"
                                ? "apartment-filter active-all"
                                : "apartment-filter"
                        }

                    >

                        Tous

                    </button>


                    <button

                        type="button"

                        onClick={() =>
                            setStatusFilter("available")
                        }

                        className={
                            statusFilter === "available"
                                ? "apartment-filter active-available"
                                : "apartment-filter"
                        }

                    >

                        Disponibles

                    </button>


                    <button

                        type="button"

                        onClick={() =>
                            setStatusFilter("occupied")
                        }

                        className={
                            statusFilter === "occupied"
                                ? "apartment-filter active-occupied"
                                : "apartment-filter"
                        }

                    >

                        Occupés

                    </button>

                </div>


                {/* =====================================================
                    STATISTIQUES
                ====================================================== */}

                <div className="apartments-stats">

                    <StatsCard

                        title="Appartements"

                        value={
                            apartments.length
                        }

                        color="blue"

                    />


                    <StatsCard

                        title="Disponibles"

                        value={
                            availableApartments.length
                        }

                        color="green"

                    />


                    <StatsCard

                        title="Occupés"

                        value={
                            occupiedApartments.length
                        }

                        color="red"

                    />

                </div>


                {/* =====================================================
                    RECHERCHE
                ====================================================== */}

                <div className="apartments-search-row">

                    <SearchBar

                        value={search}

                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }

                        placeholder="Rechercher un appartement..."

                    />

                </div>


                {/* =====================================================
                    TABLEAU
                ====================================================== */}

                <div className="apartments-table-wrapper">

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
                            filteredApartments.map(
                                apartment => {

                                    const building =
                                        buildings.find(
                                            b =>
                                                b.id ==
                                                apartment.building_id
                                        );


                                    const activeTenant =
                                        tenants.find(
                                            t =>
                                                t.apartmentId ==
                                                    apartment.id &&
                                                t.status === "Actif"
                                        );


                                    return (

                                        <tr
                                            key={
                                                apartment.id
                                            }
                                        >

                                            <td className="apartment-number-cell">

                                                {
                                                    apartment.number
                                                }

                                            </td>


                                            <td>

                                                {
                                                    building?.name ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    apartment.type ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    apartment.surface ||
                                                    "-"
                                                }

                                                {" "}m²

                                            </td>


                                            <td>

                                                {
                                                    Number(
                                                        apartment.rent ||
                                                        0
                                                    ).toLocaleString()
                                                }

                                                {" "}FCFA

                                            </td>


                                            <td>

                                                <Badge

                                                    color={
                                                        activeTenant
                                                            ? "red"
                                                            : "green"
                                                    }

                                                >

                                                    {
                                                        activeTenant
                                                            ? "Occupé"
                                                            : "Disponible"
                                                    }

                                                </Badge>

                                            </td>


                                            <td>

                                                <div className="apartment-actions">

                                                    <Button

                                                        color="blue"

                                                        onClick={() =>
                                                            editApartment(
                                                                apartment
                                                            )
                                                        }

                                                    >

                                                        ✏️

                                                    </Button>


                                                    <Button

                                                        color="red"

                                                        onClick={() =>
                                                            deleteApartment(
                                                                apartment.id
                                                            )
                                                        }

                                                    >

                                                        🗑️

                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                }
                            )
                        }

                    </Table>

                </div>


                {/* =====================================================
                    MODAL
                ====================================================== */}

                <Modal

                    open={
                        showModal
                    }

                    title={
                        editingId
                            ? "Modifier un appartement"
                            : "Nouvel appartement"
                    }

                    onClose={() => {

                        setShowModal(false);

                        resetForm();

                    }}

                >

                    <form

                        onSubmit={
                            addApartment
                        }

                        className="apartment-form"

                    >

                        <div className="apartment-form-grid">


                            {/* IMMEUBLE */}

                            <select

                                value={
                                    buildingId
                                }

                                onChange={(e) =>
                                    setBuildingId(
                                        e.target.value
                                    )
                                }

                                required

                            >

                                <option value="">
                                    Choisir un immeuble
                                </option>


                                {
                                    buildings.map(
                                        (building) => (

                                            <option
                                                key={
                                                    building.id
                                                }
                                                value={
                                                    building.id
                                                }
                                            >

                                                {
                                                    building.name
                                                }

                                            </option>

                                        )
                                    )
                                }

                            </select>


                            {/* NUMÉRO */}

                            <input

                                type="text"

                                placeholder="Numéro appartement"

                                value={
                                    number
                                }

                                onChange={(e) =>
                                    setNumber(
                                        e.target.value
                                    )
                                }

                                required

                            />


                            {/* TYPE */}

                            <select

                                value={
                                    type
                                }

                                onChange={(e) =>
                                    setType(
                                        e.target.value
                                    )
                                }

                                required

                            >

                                <option value="">
                                    Type (Studio, F2, F3...)
                                </option>

                                <option value="F1">
                                    F1
                                </option>

                                <option value="F2">
                                    F2
                                </option>

                                <option value="F3">
                                    F3
                                </option>

                                <option value="F4">
                                    F4
                                </option>

                                <option value="F5">
                                    F5
                                </option>

                            </select>


                            {/* SURFACE */}

                            <input

                                type="number"

                                placeholder="Surface en m²"

                                value={
                                    surface
                                }

                                onChange={(e) =>
                                    setSurface(
                                        e.target.value
                                    )
                                }

                                min="0"

                                required

                            />


                            {/* LOYER */}

                            <input

                                type="number"

                                placeholder="Loyer mensuel"

                                value={
                                    rent
                                }

                                onChange={(e) =>
                                    setRent(
                                        e.target.value
                                    )
                                }

                                min="0"

                                required

                            />


                            {/* CAUTION */}

                            <input

                                type="number"

                                placeholder="Montant caution"

                                value={
                                    deposit
                                }

                                onChange={(e) =>
                                    setDeposit(
                                        e.target.value
                                    )
                                }

                                min="0"

                                required

                            />

                        </div>


                        {/* ACTIONS */}

                        <div className="apartment-form-actions">

                            <Button

                                color="red"

                                type="button"

                                onClick={() => {

                                    setShowModal(
                                        false
                                    );

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