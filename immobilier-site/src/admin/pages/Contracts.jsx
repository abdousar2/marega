import { useContext, useMemo, useState } from "react";
import { API_BASE } from "../../services/config";
import { AuthContext } from "../../context/AuthContext";
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

import {
    hasPermission
} from "../../config/permissions";


export default function Contracts() {


    // =========================================================
    // UTILISATEURS / PERMISSIONS
    // =========================================================

    // On récupère le rôle via AuthContext.
    // Import dynamique impossible ici, donc on l'ajoute
    // directement avec useContext.
    //
    // Si ton AuthContext est déjà utilisé ailleurs dans Layout,
    // cela ne pose aucun problème.

    const { user } = useContext(AuthContext);

    const role =
        user?.role;


    const canUpdate =
        hasPermission(
            role,
            "contracts",
            "update"
        );


    const canDelete =
        hasPermission(
            role,
            "contracts",
            "delete"
        );    


    // =========================================================
    // DONNÉES
    // =========================================================

    const { tenants } =
        useContext(TenantsContext);


    const { apartments } =
        useContext(ApartmentsContext);


    const {
        contracts,
        loading,
        reloadContracts
    } =
        useContext(ContractsContext);


    // =========================================================
    // FORMULAIRE
    // =========================================================

    const [tenantId, setTenantId] =
        useState("");


    const [identityNumber, setIdentityNumber] =
        useState("");


    const [level, setLevel] =
        useState("");


    const [startDate, setStartDate] =
        useState("");


    const [endDate, setEndDate] =
        useState("");


    const [monthlyRent, setMonthlyRent] =
        useState("");


    const [charges, setCharges] =
        useState("");


    const [deposit, setDeposit] =
        useState("");


    const [paymentDay, setPaymentDay] =
        useState(5);


    const [status, setStatus] =
        useState("Actif");


    const [notes, setNotes] =
        useState("");


    // =========================================================
    // RECHERCHE
    // =========================================================

    const [search, setSearch] =
        useState("");


    // =========================================================
    // MODAL
    // =========================================================

    const [showModal, setShowModal] =
        useState(false);


    const [editingContract, setEditingContract] =
        useState(null);


    const [saving, setSaving] =
        useState(false);


    // =========================================================
    // SUPPRESSION
    // =========================================================

    const [deletingId, setDeletingId] =
        useState(null);


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) return "—";


        const [year, month, day] =
            String(date)
                .substring(0, 10)
                .split("-");


        return `${day}/${month}/${year}`;

    };


    // =========================================================
    // DATE POUR INPUT
    // =========================================================

    const dateForInput = (date) => {

        if (!date) return "";


        return String(date)
            .substring(0, 10);

    };


    // =========================================================
    // STATISTIQUES
    // =========================================================

    const activeContracts =
        contracts.filter(
            c => c.status === "Actif"
        );


    // =========================================================
    // RECHERCHE
    // =========================================================

    const filteredContracts =
        useMemo(() => {

            return contracts.filter(
                contract => {

                    const tenant =
                        tenants.find(
                            t =>
                                t.id ==
                                contract.tenant_id
                        );


                    const fullname =
                        `${tenant?.first_name ?? ""}
                         ${tenant?.last_name ?? ""}`
                            .toLowerCase();


                    const contractNumber =
                        String(
                            contract.contract_number ?? ""
                        )
                            .toLowerCase();


                    const query =
                        search.toLowerCase();


                    return (
                        fullname.includes(query) ||
                        contractNumber.includes(query)
                    );

                }
            );

        }, [
            contracts,
            tenants,
            search
        ]);


    // =========================================================
    // RESET FORMULAIRE
    // =========================================================

    const resetForm = () => {

        setTenantId("");
        setIdentityNumber("");
        setLevel("");
        setStartDate("");
        setEndDate("");
        setMonthlyRent("");
        setCharges("");
        setDeposit("");
        setPaymentDay(5);
        setStatus("Actif");
        setNotes("");
        setEditingContract(null);

    };


    // =========================================================
    // OUVRIR NOUVEAU CONTRAT
    // =========================================================

    const openCreateModal = () => {

        resetForm();

        setShowModal(true);

    };


    // =========================================================
    // OUVRIR MODIFICATION
    // =========================================================

    const openEditModal = (contract) => {

        if (!canUpdate) {
            return;
        }


        setEditingContract(
            contract
        );


        setTenantId(
            String(
                contract.tenant_id ?? ""
            )
        );


        setIdentityNumber(
            contract.identity_number ?? ""
        );


        setLevel(
            contract.level ?? ""
        );


        setStartDate(
            dateForInput(
                contract.start_date
            )
        );


        setEndDate(
            dateForInput(
                contract.end_date
            )
        );


        setMonthlyRent(
            contract.monthly_rent ?? ""
        );


        setCharges(
            contract.charges ?? ""
        );


        setDeposit(
            contract.deposit ?? ""
        );


        setPaymentDay(
            contract.payment_day ?? 5
        );


        setStatus(
            contract.status ?? "Actif"
        );


        setNotes(
            contract.notes ?? ""
        );


        setShowModal(true);

    };


    // =========================================================
    // CRÉATION / MODIFICATION
    // =========================================================

    const saveContract = async (e) => {

        e.preventDefault();


        // -----------------------------------------------------
        // VALIDATION LOCATAIRE
        // -----------------------------------------------------

        const tenant =
            tenants.find(
                t =>
                    t.id ==
                    tenantId
            );


        if (!tenant) {

            alert(
                "Locataire introuvable."
            );

            return;

        }


        // -----------------------------------------------------
        // VALIDATION CNI
        // -----------------------------------------------------

        if (
            !identityNumber.trim()
        ) {

            alert(
                "Veuillez renseigner le numéro de carte d'identité."
            );

            return;

        }


        // -----------------------------------------------------
        // VALIDATION NIVEAU
        // -----------------------------------------------------

        if (!level.trim()) {

            alert(
                "Veuillez renseigner le niveau de l'appartement."
            );

            return;

        }


        // -----------------------------------------------------
        // APPARTEMENT
        // -----------------------------------------------------

        const apartment =
            apartments.find(
                a =>
                    a.id ==
                    tenant.apartment_id
            );


        if (!apartment) {

            alert(
                "Appartement introuvable."
            );

            return;

        }


        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            tenant_id:
                Number(tenant.id),

            apartment_id:
                Number(apartment.id),

            contract_number:
                editingContract?.contract_number,

            identity_number:
                identityNumber.trim(),

            level:
                level.trim(),

            start_date:
                startDate,

            end_date:
                endDate,

            monthly_rent:
                Number(monthlyRent),

            charges:
                Number(charges || 0),

            deposit:
                Number(deposit || 0),

            payment_day:
                Number(paymentDay),

            status,

            notes:
                notes.trim()

        };


        try {

            setSaving(true);


            // =================================================
            // MODIFICATION
            // =================================================

            if (editingContract) {

                await LeasesService.update(

                    editingContract.id,

                    payload

                );

            }


            // =================================================
            // CRÉATION
            // =================================================

            else {

                await LeasesService.create(
                    payload
                );

            }


            // =================================================
            // RECHARGEMENT
            // =================================================

            await reloadContracts();


            // =================================================
            // FERMETURE
            // =================================================

            resetForm();

            setShowModal(false);

        }

        catch (err) {

            console.error(
                err
            );


            alert(
                editingContract
                    ? "Impossible de modifier le contrat."
                    : "Impossible de créer le contrat."
            );

        }

        finally {

            setSaving(false);

        }

    };


    // =========================================================
    // SUPPRESSION
    // =========================================================

    const deleteContract = async (
        contract
    ) => {

        if (!canDelete) {
            return;
        }


        const confirmed =
            window.confirm(

                `Voulez-vous vraiment supprimer le contrat ${contract.contract_number} ?\n\nCette action supprimera également les loyers associés s'ils ne possèdent aucun paiement.`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(
                contract.id
            );


            await LeasesService.remove(
                contract.id
            );


            await reloadContracts();

        }

        catch (err) {

            console.error(
                err
            );


            // =================================================
            // ERREUR MÉTIER 409
            // =================================================

            if (
                err?.status === 409
            ) {

                alert(
                    "Impossible de supprimer ce contrat : des paiements sont associés à ses loyers. L'historique financier doit être conservé."
                );

            }

            else {

                alert(
                    "Impossible de supprimer le contrat."
                );

            }

        }

        finally {

            setDeletingId(
                null
            );

        }

    };


    // =========================================================
    // CHARGEMENT
    // =========================================================

    if (loading) {

        return (

            <Layout>

                <h2>
                    Chargement des contrats...
                </h2>

            </Layout>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <Layout>


            {/* =================================================
                HEADER
            ================================================= */}

            <PageHeader

                title="Gestion des contrats"

                subtitle="Créez et gérez les contrats de location."

                buttonLabel="+ Nouveau contrat"

                onButtonClick={
                    openCreateModal
                }

            />


            <br />


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-6
                mb-8
            ">

                <StatsCard
                    title="Contrats"
                    value={
                        contracts.length
                    }
                    color="blue"
                />


                <StatsCard
                    title="Contrats actifs"
                    value={
                        activeContracts.length
                    }
                    color="green"
                />


                <StatsCard
                    title="Contrats terminés"
                    value={
                        contracts.length -
                        activeContracts.length
                    }
                    color="orange"
                />

            </div>


            <br />


            {/* =================================================
                RECHERCHE
            ================================================= */}

            <SearchBar

                value={search}

                onChange={
                    e =>
                        setSearch(
                            e.target.value
                        )
                }

                placeholder="Rechercher un locataire ou un contrat..."

            />


            <br />
            <br />


            {/* =================================================
                MODAL
            ================================================= */}

            <Modal

                open={showModal}

                title={
                    editingContract
                        ? "Modifier le contrat"
                        : "Nouveau contrat"
                }

                onClose={() => {

                    if (saving) {
                        return;
                    }

                    resetForm();

                    setShowModal(false);

                }}

            >

                <form

                    onSubmit={
                        saveContract
                    }

                    className="space-y-5"

                >


                    {/* LOCATAIRE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">

                            Locataire

                        </label>


                        <select

                            value={tenantId}

                            onChange={
                                e =>
                                    setTenantId(
                                        e.target.value
                                    )
                            }

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        >

                            <option value="">

                                Choisir un locataire

                            </option>


                            {tenants
                                .filter(
                                    t =>
                                        t.status ===
                                        "Actif"
                                )
                                .map(
                                    tenant => (

                                        <option

                                            key={
                                                tenant.id
                                            }

                                            value={
                                                tenant.id
                                            }

                                        >

                                            {
                                                tenant.first_name
                                            }

                                            {" "}

                                            {
                                                tenant.last_name
                                            }

                                        </option>

                                    )
                                )}

                        </select>

                    </div>


                    {/* CNI */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">

                            Numéro de carte d'identité

                        </label>


                        <input

                            type="text"

                            value={
                                identityNumber
                            }

                            onChange={
                                e =>
                                    setIdentityNumber(
                                        e.target.value
                                    )
                            }

                            placeholder="Ex : 1 790 1997 00028"

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* NIVEAU */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">

                            Niveau / Étage

                        </label>


                        <select

                            value={level}

                            onChange={
                                e =>
                                    setLevel(
                                        e.target.value
                                    )
                            }

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        >

                            <option value="">
                                Choisir le niveau
                            </option>

                            <option value="Rez-de-chaussée">
                                Rez-de-chaussée
                            </option>

                            <option value="1er étage">
                                1er étage
                            </option>

                            <option value="2ème étage">
                                2ème étage
                            </option>

                            <option value="3ème étage">
                                3ème étage
                            </option>

                            <option value="4ème étage">
                                4ème étage
                            </option>

                            <option value="5ème étage">
                                5ème étage
                            </option>

                            <option value="6ème étage">
                                6ème étage
                            </option>

                            <option value="7ème étage">
                                7ème étage
                            </option>

                            <option value="8ème étage">
                                8ème étage
                            </option>

                            <option value="9ème étage">
                                9ème étage
                            </option>

                            <option value="10ème étage">
                                10ème étage
                            </option>

                        </select>

                    </div>


                    {/* DATES */}

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                    ">

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">

                                Date de début

                            </label>


                            <input

                                type="date"

                                value={
                                    startDate
                                }

                                onChange={
                                    e =>
                                        setStartDate(
                                            e.target.value
                                        )
                                }

                                className="
                                    border
                                    p-3
                                    w-full
                                    rounded-xl
                                "

                            />

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">

                                Date de fin

                            </label>


                            <input

                                type="date"

                                value={
                                    endDate
                                }

                                onChange={
                                    e =>
                                        setEndDate(
                                            e.target.value
                                        )
                                }

                                className="
                                    border
                                    p-3
                                    w-full
                                    rounded-xl
                                "

                            />

                        </div>

                    </div>


                    {/* FINANCES */}

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-3
                        gap-4
                    ">


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">

                                Loyer mensuel

                            </label>


                            <input

                                type="number"

                                value={
                                    monthlyRent
                                }

                                onChange={
                                    e =>
                                        setMonthlyRent(
                                            e.target.value
                                        )
                                }

                                className="
                                    border
                                    p-3
                                    w-full
                                    rounded-xl
                                "

                            />

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">

                                Charges

                            </label>


                            <input

                                type="number"

                                value={
                                    charges
                                }

                                onChange={
                                    e =>
                                        setCharges(
                                            e.target.value
                                        )
                                }

                                className="
                                    border
                                    p-3
                                    w-full
                                    rounded-xl
                                "

                            />

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">

                                Caution

                            </label>


                            <input

                                type="number"

                                value={
                                    deposit
                                }

                                onChange={
                                    e =>
                                        setDeposit(
                                            e.target.value
                                        )
                                }

                                className="
                                    border
                                    p-3
                                    w-full
                                    rounded-xl
                                "

                            />

                        </div>

                    </div>


                    {/* JOUR DE PAIEMENT */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">

                            Jour de paiement

                        </label>


                        <input

                            type="number"

                            min="1"

                            max="31"

                            value={
                                paymentDay
                            }

                            onChange={
                                e =>
                                    setPaymentDay(
                                        e.target.value
                                    )
                            }

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* STATUT */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">

                            Statut

                        </label>


                        <select

                            value={
                                status
                            }

                            onChange={
                                e =>
                                    setStatus(
                                        e.target.value
                                    )
                            }

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        >

                            <option value="Actif">
                                Actif
                            </option>

                            <option value="Terminé">
                                Terminé
                            </option>

                            <option value="Résilié">
                                Résilié
                            </option>

                        </select>

                    </div>


                    {/* NOTES */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">

                            Notes

                        </label>


                        <textarea

                            value={
                                notes
                            }

                            onChange={
                                e =>
                                    setNotes(
                                        e.target.value
                                    )
                            }

                            rows="3"

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* BOUTONS */}

                    <div className="
                        flex
                        justify-end
                        gap-3
                        pt-4
                    ">


                        <Button

                            type="button"

                            color="red"

                            onClick={() => {

                                if (saving) {
                                    return;
                                }

                                resetForm();

                                setShowModal(
                                    false
                                );

                            }}

                        >

                            Annuler

                        </Button>


                        <Button

                            type="submit"

                            color="blue"

                            disabled={saving}

                        >

                            {saving
                                ? "Enregistrement..."
                                : editingContract
                                    ? "Enregistrer"
                                    : "Créer"
                            }

                        </Button>

                    </div>

                </form>

            </Modal>


            {/* =================================================
                LISTE DES CONTRATS
            ================================================= */}

            <div className="
                grid
                grid-cols-1
                lg:grid-cols-2
                xl:grid-cols-3
                gap-6
                mt-8
            ">


                {filteredContracts.length === 0 ? (

                    <Empty

                        title="Aucun contrat"

                        subtitle="Aucun contrat ne correspond à votre recherche."

                    />

                ) : (

                    filteredContracts.map(
                        contract => {

                            const tenant =
                                tenants.find(
                                    t =>
                                        t.id ==
                                        contract.tenant_id
                                );


                            const apartment =
                                apartments.find(
                                    a =>
                                        a.id ==
                                        contract.apartment_id
                                );


                            return (

                                <div

                                    key={
                                        contract.id
                                    }

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


                                    {/* HEADER */}

                                    <div className="
                                        flex
                                        justify-between
                                        items-start
                                        px-3
                                        pt-2
                                    ">

                                        <div>

                                            <p className="
                                                text-slate-500
                                                text-sm
                                            ">

                                                Contrat

                                            </p>


                                            <h2 className="
                                                text-2xl
                                                font-bold
                                                mt-1
                                            ">

                                                {
                                                    contract.contract_number
                                                }

                                            </h2>

                                        </div>


                                        <Badge

                                            color={
                                                contract.status ===
                                                "Actif"
                                                    ? "green"
                                                    : "red"
                                            }

                                        >

                                            {
                                                contract.status
                                            }

                                        </Badge>

                                    </div>


                                    {/* INFORMATIONS */}

                                    <div className="
                                        mt-6
                                        space-y-3
                                    ">

                                        <p>

                                            👤{" "}

                                            <strong>

                                                {
                                                    tenant?.first_name
                                                }

                                                {" "}

                                                {
                                                    tenant?.last_name
                                                }

                                            </strong>

                                        </p>


                                        <p>

                                            🪪 Carte d'identité :{" "}

                                            <strong>

                                                {
                                                    contract.identity_number ||
                                                    "—"
                                                }

                                            </strong>

                                        </p>


                                        <p>

                                            🏠 Appartement{" "}

                                            <strong>

                                                {
                                                    apartment?.number
                                                }

                                            </strong>

                                        </p>


                                        <p>

                                            🏢 Niveau :{" "}

                                            <strong>

                                                {
                                                    contract.level ||
                                                    "—"
                                                }

                                            </strong>

                                        </p>


                                        <p>

                                            📅 Début :{" "}

                                            {
                                                formatDate(
                                                    contract.start_date
                                                )
                                            }

                                        </p>


                                        <p>

                                            📅 Fin :{" "}

                                            {
                                                formatDate(
                                                    contract.end_date
                                                )
                                            }

                                        </p>

                                    </div>


                                    {/* FINANCES */}

                                    <div className="
                                        mt-6
                                        grid
                                        grid-cols-2
                                        gap-4
                                    ">


                                        <div className="
                                            bg-slate-50
                                            rounded-2xl
                                            p-4
                                        ">

                                            <div className="
                                                text-slate-500
                                                text-sm
                                            ">

                                                Loyer

                                            </div>


                                            <div className="
                                                text-xl
                                                font-bold
                                                text-green-700
                                                mt-2
                                            ">

                                                {
                                                    Number(
                                                        contract.monthly_rent
                                                    ).toLocaleString()
                                                }{" "}

                                                FCFA

                                            </div>

                                        </div>


                                        <div className="
                                            bg-slate-50
                                            rounded-2xl
                                            p-4
                                        ">

                                            <div className="
                                                text-slate-500
                                                text-sm
                                            ">

                                                Caution

                                            </div>


                                            <div className="
                                                text-xl
                                                font-bold
                                                mt-2
                                            ">

                                                {
                                                    Number(
                                                        contract.deposit
                                                    ).toLocaleString()
                                                }{" "}

                                                FCFA

                                            </div>

                                        </div>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="
                                        flex
                                        flex-wrap
                                        gap-2
                                        mt-6
                                    ">


                                        {contract.pdf_path && (

                                            <Button

                                                color="blue"

                                                onClick={() =>
                                                    window.open(
                                                        `${API_BASE}${contract.pdf_path}`,
                                                        "_blank"
                                                    )
                                                }

                                            >

                                                📄 Contrat PDF

                                            </Button>

                                        )}


                                        {canUpdate && (

                                            <Button

                                                color="orange"

                                                onClick={() =>
                                                    openEditModal(
                                                        contract
                                                    )
                                                }

                                            >

                                                ✏️ Modifier

                                            </Button>

                                        )}


                                        {canDelete && (

                                            <Button

                                                color="red"

                                                onClick={() =>
                                                    deleteContract(
                                                        contract
                                                    )
                                                }

                                                disabled={
                                                    deletingId ===
                                                    contract.id
                                                }

                                            >

                                                {
                                                    deletingId ===
                                                    contract.id
                                                        ? "Suppression..."
                                                        : "🗑️ Supprimer"
                                                }

                                            </Button>

                                        )}

                                    </div>

                                </div>

                            );

                        }
                    )

                )}

            </div>

        </Layout>

    );

}