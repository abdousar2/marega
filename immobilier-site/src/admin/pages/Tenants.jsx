import { useContext, useState, useMemo } from "react";
import Layout from "../Layout";

import {
    PageHeader,
    StatsCard,
    SearchBar,
    Modal,
    Button,
} from "../../components/ui";

import { ApartmentsContext } from "../../context/ApartmentsContext";
import { TenantsContext } from "../../context/TenantsContext";
import { BuildingsContext } from "../../context/BuildingsContext";

import TenantsService from "../../services/tenants.service";

import "./Tenants.css";


export default function Tenants() {

    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (date) => {

        if (!date) return "—";

        const datePart =
            String(date).split("T")[0];

        const [year, month, day] =
            datePart.split("-");

        if (!year || !month || !day) {
            return date;
        }

        return `${day}/${month}/${year}`;

    };


    /* =========================================================
       CONTEXTS
    ========================================================= */

    const { apartments } =
        useContext(ApartmentsContext);

    const { buildings } =
        useContext(BuildingsContext);

    const {
        tenants,
        loading,
        reloadTenants,
    } = useContext(TenantsContext);


    /* =========================================================
       FORMULAIRE
    ========================================================= */

    const [name, setName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [email, setEmail] =
        useState("");

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


    /* =========================================================
       FILTRES
    ========================================================= */

    const [showFormer, setShowFormer] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    const [filter, setFilter] =
        useState("all");

    const [showModal, setShowModal] =
        useState(false);


    /* =========================================================
       LOCATAIRES FILTRÉS
    ========================================================= */

    const filteredTenants = useMemo(() => {

      return tenants

          .filter((tenant) => {

              if (!showFormer && tenant.status === "Parti") {
                  return false;
              }

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
                  `${tenant.first_name || ""} ${tenant.last_name || ""}`
                      .toLowerCase();

              return fullname.includes(
                  search.toLowerCase()
              );

          });

  }, [
      tenants,
      search,
      filter,
      showFormer
  ]);


    /* =========================================================
       CHARGEMENT
    ========================================================= */

    if (loading) {

        return (

            <Layout>

                <div className="tenants-loading">

                    Chargement des locataires...

                </div>

            </Layout>

        );

    }


    /* =========================================================
       STATISTIQUES
    ========================================================= */

    const activeTenants =
        tenants.filter(
            (tenant) =>
                tenant.status === "Actif"
        );


    const formerTenants =
        tenants.filter(
            (tenant) =>
                tenant.status === "Parti"
        );


    /* =========================================================
       RÉINITIALISATION FORMULAIRE
    ========================================================= */

    const resetForm = () => {

        setEditingId(null);

        setName("");

        setPhone("");

        setEmail("");

        setProfession("");

        setEntryDate("");

        setDeposit("");

        setStatus("Actif");

        setApartmentId("");

    };


    /* =========================================================
       OUVRIR NOUVEAU LOCATAIRE
    ========================================================= */

    const openCreateModal = () => {

        resetForm();

        setShowModal(true);

    };


    /* =========================================================
       AJOUT / MODIFICATION
    ========================================================= */

    const addTenant = async (e) => {

        e.preventDefault();


        if (!apartmentId) {

            alert(
                "Choisissez un appartement."
            );

            return;

        }


        try {

            const tenant = {

                apartment_id:
                    Number(apartmentId),

                first_name:
                    name,

                last_name:
                    "",

                phone,

                email,

                id_type: "",

                id_number: "",

                profession,

                employer: "",

                emergency_contact: "",

                emergency_phone: "",

                entry_date:
                    entryDate,

                exit_date:
                    null,

                deposit:
                    Number(deposit),

                status,

                notes: ""

            };


            if (editingId) {

                await TenantsService.update(
                    editingId,
                    tenant
                );

            }

            else {

                await TenantsService.create(
                    tenant
                );

            }


            await reloadTenants();

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
       MODIFIER LOCATAIRE
    ========================================================= */

    const editTenant = (tenant) => {

        setName(
            `${tenant.first_name || ""} ${
                tenant.last_name || ""
            }`.trim()
        );

        setPhone(
            tenant.phone || ""
        );

        setEmail(
            tenant.email || ""
        );

        setProfession(
            tenant.profession || ""
        );

        setEntryDate(
            tenant.entry_date || ""
        );

        setDeposit(
            tenant.deposit || ""
        );

        setStatus(
            tenant.status || "Actif"
        );

        setApartmentId(
            tenant.apartment_id || ""
        );

        setEditingId(
            tenant.id
        );

        setShowModal(true);

    };


    /* =========================================================
       SUPPRIMER LOCATAIRE
    ========================================================= */

    const deleteTenant = async (id) => {

        if (
            !window.confirm(
                "Supprimer ce locataire ?"
            )
        ) {

            return;

        }


        try {

            await TenantsService.remove(id);

            await reloadTenants();

        }

        catch (err) {

            console.error(err);

            alert(
                "Impossible de supprimer ce locataire."
            );

        }

    };


    /* =========================================================
       MARQUER COMME PARTI
    ========================================================= */

    const markTenantAsFormer =
        async (tenant) => {

            try {

                await TenantsService.update(
                    tenant.id,
                    {

                        apartment_id:
                            tenant.apartment_id,

                        first_name:
                            tenant.first_name,

                        last_name:
                            tenant.last_name,

                        phone:
                            tenant.phone,

                        email:
                            tenant.email,

                        id_type:
                            tenant.id_type,

                        id_number:
                            tenant.id_number,

                        profession:
                            tenant.profession,

                        employer:
                            tenant.employer,

                        emergency_contact:
                            tenant.emergency_contact,

                        emergency_phone:
                            tenant.emergency_phone,

                        entry_date:
                            tenant.entry_date,

                        exit_date:
                            new Date()
                                .toISOString()
                                .slice(0, 10),

                        deposit:
                            tenant.deposit,

                        status:
                            "Parti",

                        notes:
                            tenant.notes

                    }
                );


                await reloadTenants();

            }

            catch (err) {

                console.error(err);

                alert(
                    "Impossible de clôturer ce bail."
                );

            }

        };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <Layout>

            <div className="tenants-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <PageHeader

                    title="Gestion des locataires"

                    subtitle="Ajoutez, modifiez et gérez vos locataires."

                    buttonLabel="+ Nouveau locataire"

                    onButtonClick={
                        openCreateModal
                    }

                />


                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                <div className="tenants-stats">

                    <StatsCard
                        title="Locataires"
                        value={
                            tenants.length
                        }
                        color="blue"
                    />

                    <StatsCard
                        title="Actifs"
                        value={
                            activeTenants.length
                        }
                        color="green"
                    />

                    <StatsCard
                        title="Partis"
                        value={
                            formerTenants.length
                        }
                        color="red"
                    />

                </div>


                {/* =================================================
                    RECHERCHE
                ================================================= */}

                <div className="tenants-search">

                    <SearchBar

                        value={search}

                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }

                        placeholder="Rechercher un locataire..."

                    />

                </div>


                {/* =================================================
                    MODAL
                ================================================= */}

                <Modal

                    open={
                        showModal
                    }

                    title={
                        editingId
                            ? "Modifier un locataire"
                            : "Nouveau locataire"
                    }

                    onClose={() => {

                        setShowModal(false);

                        resetForm();

                    }}

                >

                    <form

                        onSubmit={
                            addTenant
                        }

                        className="tenant-form"

                    >

                        <div className="tenant-form-grid">


                            <input

                                type="text"

                                placeholder="Nom du locataire"

                                value={name}

                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }

                                required

                            />


                            <input

                                type="text"

                                placeholder="Téléphone"

                                value={phone}

                                onChange={(e) =>
                                    setPhone(
                                        e.target.value
                                    )
                                }

                                required

                            />


                            <input

                                type="email"

                                placeholder="Email (facultatif)"

                                value={email}

                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }

                            />


                            <input

                                type="text"

                                placeholder="Profession"

                                value={profession}

                                onChange={(e) =>
                                    setProfession(
                                        e.target.value
                                    )
                                }

                            />


                            <div className="tenant-form-field">

                                <label>
                                    Début de location
                                </label>

                                <input

                                    type="date"

                                    value={
                                        entryDate
                                    }

                                    onChange={(e) =>
                                        setEntryDate(
                                            e.target.value
                                        )
                                    }

                                />

                            </div>


                            <input

                                type="number"

                                placeholder="Caution versée"

                                value={
                                    deposit
                                }

                                onChange={(e) =>
                                    setDeposit(
                                        e.target.value
                                    )
                                }

                                min="0"

                            />


                            <select

                                value={
                                    status
                                }

                                onChange={(e) =>
                                    setStatus(
                                        e.target.value
                                    )
                                }

                            >

                                <option value="Actif">
                                    Actif
                                </option>

                                <option value="Parti">
                                    Parti
                                </option>

                            </select>


                            <select

                                value={
                                    apartmentId
                                }

                                onChange={(e) =>
                                    setApartmentId(
                                        e.target.value
                                    )
                                }

                                required

                            >

                                <option value="">
                                    Choisir appartement
                                </option>


                                {
                                    apartments

                                        .filter(
                                            (apartment) => {

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

                                            }
                                        )

                                        .map(
                                            (apartment) => (

                                                <option

                                                    key={
                                                        apartment.id
                                                    }

                                                    value={
                                                        apartment.id
                                                    }

                                                >

                                                    {
                                                        apartment.number
                                                    }

                                                </option>

                                            )
                                        )
                                }

                            </select>

                        </div>


                        <div className="tenant-form-actions">

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


                {/* =================================================
                    ANCIENS LOCATAIRES
                ================================================= */}

                <div className="tenants-former-toggle">

                    <label>

                        <input

                            type="checkbox"

                            checked={
                                showFormer
                            }

                            onChange={() =>
                                setShowFormer(
                                    !showFormer
                                )
                            }

                        />

                        <span>
                            Afficher les anciens locataires
                        </span>

                    </label>

                </div>


                {/* =================================================
                    FILTRES
                ================================================= */}

                <div className="tenant-filters">

                    <button

                        type="button"

                        onClick={() =>
                            setFilter("all")
                        }

                        className={
                            filter === "all"
                                ? "tenant-filter active-all"
                                : "tenant-filter"
                        }

                    >

                        Tous ({tenants.length})

                    </button>


                    <button

                        type="button"

                        onClick={() =>
                            setFilter("active")
                        }

                        className={
                            filter === "active"
                                ? "tenant-filter active-active"
                                : "tenant-filter"
                        }

                    >

                        Actifs ({
                            activeTenants.length
                        })

                    </button>


                    <button

                        type="button"

                        onClick={() =>
                            setFilter("former")
                        }

                        className={
                            filter === "former"
                                ? "tenant-filter active-former"
                                : "tenant-filter"
                        }

                    >

                        Partis ({
                            formerTenants.length
                        })

                    </button>

                </div>


                {/* =================================================
                    CARTES LOCATAIRES
                ================================================= */}

                <div className="tenants-grid">

                    {
                        filteredTenants.map(
                            (tenant) => {

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


                                return (

                                    <div

                                        key={
                                            tenant.id
                                        }

                                        className="tenant-card"

                                    >

                                        {/* PROFIL */}

                                        <div className="tenant-card-header">

                                            <div className="tenant-avatar">

                                                {
                                                    (
                                                        tenant.first_name ||
                                                        "?"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()
                                                }

                                            </div>


                                            <div className="tenant-identity">

                                                <h2>

                                                    {
                                                        tenant.first_name
                                                    }

                                                    {" "}

                                                    {
                                                        tenant.last_name
                                                    }

                                                </h2>


                                                <p>

                                                    {
                                                        tenant.profession ||
                                                        "Profession non renseignée"
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {/* INFORMATIONS */}

                                        <div className="tenant-information">

                                            <p>
                                                📞 {tenant.phone || "—"}
                                            </p>


                                            {
                                                tenant.email && (

                                                    <p>
                                                        📧 {tenant.email}
                                                    </p>

                                                )
                                            }


                                            <p>
                                                💼 {
                                                    tenant.profession ||
                                                    "—"
                                                }
                                            </p>


                                            <p>
                                                📅 Entrée : {
                                                    formatDate(
                                                        tenant.entry_date
                                                    )
                                                }
                                            </p>


                                            <p>
                                                💰 Caution : {
                                                    Number(
                                                        tenant.deposit ||
                                                        0
                                                    ).toLocaleString(
                                                        "fr-FR"
                                                    )
                                                } FCFA
                                            </p>


                                            <p className="tenant-location">

                                                🏢 {
                                                    building?.name ||
                                                    "Immeuble inconnu"
                                                }

                                            </p>


                                            <p className="tenant-location">

                                                🚪 Appartement {
                                                    apartment?.number ||
                                                    "—"
                                                }

                                            </p>

                                        </div>


                                        {/* STATUT */}

                                        <div
                                            className={
                                                tenant.status === "Actif"
                                                    ? "tenant-status status-active"
                                                    : "tenant-status status-former"
                                            }
                                        >

                                            {
                                                tenant.status === "Actif"
                                                    ? "🟢 Actif"
                                                    : "🔴 Parti"
                                            }

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="tenant-actions">

                                            <Button

                                                color="blue"

                                                onClick={() =>
                                                    editTenant(
                                                        tenant
                                                    )
                                                }

                                            >

                                                ✏️ Modifier

                                            </Button>


                                            <Button

                                                color="red"

                                                onClick={() =>
                                                    deleteTenant(
                                                        tenant.id
                                                    )
                                                }

                                            >

                                                🗑️ Supprimer

                                            </Button>

                                        </div>


                                        {/* CLÔTURE */}

                                        {
                                            tenant.status === "Actif" && (

                                                <button

                                                    type="button"

                                                    onClick={() =>
                                                        markTenantAsFormer(
                                                            tenant
                                                        )
                                                    }

                                                    className="tenant-leave-button"

                                                >

                                                    Marquer comme parti

                                                </button>

                                            )
                                        }

                                    </div>

                                );

                            }
                        )
                    }

                </div>

            </div>

        </Layout>

    );

}