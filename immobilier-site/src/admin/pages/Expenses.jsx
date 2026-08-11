import {
    useContext,
    useMemo,
    useState
} from "react";

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

import { ExpensesContext } from "../../context/ExpensesContext";
import { BuildingsContext } from "../../context/BuildingsContext";
import { ApartmentsContext } from "../../context/ApartmentsContext";

export default function Expenses() {

    const {
        expenses,
        loading,
        addExpense,
        updateExpense,
        deleteExpense
    } = useContext(ExpensesContext);

    const { buildings } =
        useContext(BuildingsContext);

    const { apartments } =
        useContext(ApartmentsContext);


    // =========================================================
    // ETAT
    // =========================================================

    const [search, setSearch] =
        useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingExpense, setEditingExpense] =
        useState(null);


    const [expenseDate, setExpenseDate] =
        useState("");

    const [label, setLabel] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("");

    const [beneficiary, setBeneficiary] =
        useState("");

    const [reference, setReference] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [buildingId, setBuildingId] =
        useState("");

    const [apartmentId, setApartmentId] =
        useState("");


    // =========================================================
    // CATEGORIES
    // =========================================================

    const categories = [

        "Entretien",
        "Réparation",
        "Électricité",
        "Eau",
        "Salaires",
        "Transport",
        "Fournitures",
        "Administration",
        "Taxes",
        "Travaux",
        "Achat matériel",
        "Autre"

    ];


    // =========================================================
    // MOYENS DE PAIEMENT
    // =========================================================

    const paymentMethods = [

        "Espèces",
        "Wave",
        "Orange Money",
        "Virement bancaire",
        "Chèque",
        "Autre"

    ];


    // =========================================================
    // STATISTIQUES
    // =========================================================

    const totalExpenses = useMemo(() => {

        return expenses.reduce(
            (total, expense) =>
                total + Number(expense.amount || 0),
            0
        );

    }, [expenses]);


    const currentMonthExpenses = useMemo(() => {

        const now = new Date();

        const month =
            now.getMonth();

        const year =
            now.getFullYear();

        return expenses.reduce(
            (total, expense) => {

                const date =
                    new Date(expense.expense_date);

                if (
                    date.getMonth() === month &&
                    date.getFullYear() === year
                ) {

                    return total +
                        Number(expense.amount || 0);

                }

                return total;

            },
            0
        );

    }, [expenses]);


    // =========================================================
    // FILTRAGE
    // =========================================================

    const filteredExpenses =
        useMemo(() => {

            return expenses.filter(
                expense => {

                    const searchText =
                        search.toLowerCase();

                    const matchesSearch =

                        `${expense.label || ""}`
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        `${expense.beneficiary || ""}`
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        `${expense.reference || ""}`
                            .toLowerCase()
                            .includes(searchText);


                    const matchesCategory =

                        !categoryFilter ||
                        expense.category ===
                            categoryFilter;


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );

        }, [
            expenses,
            search,
            categoryFilter
        ]);


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setExpenseDate("");
        setLabel("");
        setCategory("");
        setAmount("");
        setPaymentMethod("");
        setBeneficiary("");
        setReference("");
        setDescription("");
        setBuildingId("");
        setApartmentId("");

        setEditingExpense(null);

    };


    // =========================================================
    // OUVRIR CREATION
    // =========================================================

    const openCreateModal = () => {

        resetForm();

        setExpenseDate(
            new Date()
                .toISOString()
                .substring(0, 10)
        );

        setShowModal(true);

    };


    // =========================================================
    // OUVRIR MODIFICATION
    // =========================================================

    const openEditModal = (expense) => {

        setEditingExpense(expense);

        setExpenseDate(
            expense.expense_date
                ? String(
                    expense.expense_date
                ).substring(0, 10)
                : ""
        );

        setLabel(
            expense.label || ""
        );

        setCategory(
            expense.category || ""
        );

        setAmount(
            expense.amount || ""
        );

        setPaymentMethod(
            expense.payment_method || ""
        );

        setBeneficiary(
            expense.beneficiary || ""
        );

        setReference(
            expense.reference || ""
        );

        setDescription(
            expense.description || ""
        );

        setBuildingId(
            expense.building_id || ""
        );

        setApartmentId(
            expense.apartment_id || ""
        );

        setShowModal(true);

    };


    // =========================================================
    // CREATION / MODIFICATION
    // =========================================================

    const handleSubmit =
        async (e) => {

            e.preventDefault();


            if (!expenseDate) {

                alert(
                    "Veuillez renseigner la date."
                );

                return;

            }


            if (!label.trim()) {

                alert(
                    "Veuillez renseigner le libellé."
                );

                return;

            }


            if (!category) {

                alert(
                    "Veuillez sélectionner une catégorie."
                );

                return;

            }


            if (
                !amount ||
                Number(amount) <= 0
            ) {

                alert(
                    "Veuillez renseigner un montant valide."
                );

                return;

            }


            try {

                const payload = {

                    expense_date:
                        expenseDate,

                    label:
                        label.trim(),

                    category,

                    amount:
                        Number(amount),

                    payment_method:
                        paymentMethod,

                    beneficiary:
                        beneficiary.trim(),

                    reference:
                        reference.trim(),

                    description:
                        description.trim(),

                    building_id:
                        buildingId
                            ? Number(buildingId)
                            : null,

                    apartment_id:
                        apartmentId
                            ? Number(apartmentId)
                            : null

                };


                if (editingExpense) {

                    await updateExpense(
                        editingExpense.id,
                        payload
                    );

                }

                else {

                    await addExpense(
                        payload
                    );

                }


                resetForm();

                setShowModal(false);

            }

            catch (err) {

                console.error(err);

                alert(
                    err.message ||
                    "Impossible d'enregistrer la dépense."
                );

            }

        };


    // =========================================================
    // SUPPRESSION
    // =========================================================

    const handleDelete =
        async (expense) => {

            const confirmed =
                window.confirm(

                    `Voulez-vous vraiment supprimer la dépense "${expense.label}" ?`

                );


            if (!confirmed) {
                return;
            }


            try {

                await deleteExpense(
                    expense.id
                );

            }

            catch (err) {

                console.error(err);

                alert(
                    err.message ||
                    "Impossible de supprimer la dépense."
                );

            }

        };


    // =========================================================
    // FORMATAGE
    // =========================================================

    const formatMoney = (value) => {

        return Number(
            value || 0
        ).toLocaleString(
            "fr-FR"
        );

    };


    const formatDate = (value) => {

        if (!value) {
            return "—";
        }

        return new Date(
            value
        ).toLocaleDateString(
            "fr-FR"
        );

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <Layout>

                <h2>
                    Chargement des dépenses...
                </h2>

            </Layout>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <Layout>


            <PageHeader

                title="Gestion des dépenses"

                subtitle="Suivez les sorties d'argent de l'agence."

                buttonLabel="+ Nouvelle dépense"

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

                    title="Total des dépenses"

                    value={
                        `${formatMoney(
                            totalExpenses
                        )} FCFA`
                    }

                    color="red"

                />


                <StatsCard

                    title="Dépenses ce mois"

                    value={
                        `${formatMoney(
                            currentMonthExpenses
                        )} FCFA`
                    }

                    color="orange"

                />


                <StatsCard

                    title="Nombre de sorties"

                    value={
                        expenses.length
                    }

                    color="blue"

                />

            </div>
            <br></br>


            {/* =================================================
                RECHERCHE
            ================================================= */}

            <div className="
                flex
                flex-col
                md:flex-row
                gap-4
                mb-8
            ">


                <div className="flex-1">

                    <SearchBar

                        value={search}

                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }

                        placeholder="
                            Rechercher une dépense,
                            bénéficiaire ou référence...
                        "

                    />

                </div>


                <select

                    value={categoryFilter}

                    onChange={
                        e =>
                            setCategoryFilter(
                                e.target.value
                            )
                    }

                    className="
                        border
                        p-3
                        rounded-xl
                        bg-white
                    "

                >

                    <option value="">
                        Toutes les catégories
                    </option>

                    {categories.map(
                        item => (

                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>

                        )
                    )}

                </select>


            </div>
            <br></br>


            {/* =================================================
                LISTE
            ================================================= */}

            {filteredExpenses.length === 0 ? (

                <Empty

                    title="Aucune dépense"

                    subtitle="
                        Aucune dépense ne correspond
                        à votre recherche.
                    "

                />

            ) : (

                <div className="
                    grid
                    grid-cols-1
                    lg:grid-cols-2
                    xl:grid-cols-3
                    gap-6
                ">


                    {filteredExpenses.map(
                        expense => {


                            const building =
                                buildings.find(
                                    b =>
                                        b.id ==
                                        expense.building_id
                                );


                            const apartment =
                                apartments.find(
                                    a =>
                                        a.id ==
                                        expense.apartment_id
                                );


                            return (

                                <div

                                    key={
                                        expense.id
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


                                    <div className="
                                        flex
                                        justify-between
                                        items-start
                                    ">


                                        <div>

                                            <p className="
                                                text-slate-500
                                                text-sm
                                            ">
                                                Sortie
                                            </p>


                                            <h2 className="
                                                text-xl
                                                font-bold
                                                mt-1
                                            ">

                                                {expense.label}

                                            </h2>

                                        </div>


                                        <Badge
                                            color="red"
                                        >
                                            -
                                            {formatMoney(
                                                expense.amount
                                            )}
                                            {" "}FCFA
                                        </Badge>


                                    </div>


                                    <div className="
                                        mt-6
                                        space-y-3
                                    ">


                                        <p>

                                            📅{" "}

                                            <strong>
                                                {formatDate(
                                                    expense.expense_date
                                                )}
                                            </strong>

                                        </p>


                                        <p>

                                            🏷️ Catégorie :{" "}

                                            <strong>
                                                {expense.category ||
                                                    "—"}
                                            </strong>

                                        </p>


                                        <p>

                                            💳 Paiement :{" "}

                                            <strong>
                                                {expense.payment_method ||
                                                    "—"}
                                            </strong>

                                        </p>


                                        <p>

                                            👤 Bénéficiaire :{" "}

                                            <strong>
                                                {expense.beneficiary ||
                                                    "—"}
                                            </strong>

                                        </p>


                                        {expense.reference && (

                                            <p>

                                                🧾 Référence :{" "}

                                                <strong>
                                                    {expense.reference}
                                                </strong>

                                            </p>

                                        )}


                                        {building && (

                                            <p>

                                                🏢 Immeuble :{" "}

                                                <strong>
                                                    {building.name}
                                                </strong>

                                            </p>

                                        )}


                                        {apartment && (

                                            <p>

                                                🏠 Appartement :{" "}

                                                <strong>
                                                    {apartment.number}
                                                </strong>

                                            </p>

                                        )}


                                        {expense.description && (

                                            <p className="
                                                text-slate-500
                                                text-sm
                                                pt-2
                                            ">

                                                {expense.description}

                                            </p>

                                        )}

                                    </div>


                                    <div className="
                                        flex
                                        gap-2
                                        mt-6
                                    ">


                                        <Button

                                            variant="secondary"

                                            onClick={() =>
                                                openEditModal(
                                                    expense
                                                )
                                            }

                                        >
                                            Modifier
                                        </Button>


                                        <Button

                                            variant="danger"

                                            onClick={() =>
                                                handleDelete(
                                                    expense
                                                )
                                            }

                                        >
                                            Supprimer
                                        </Button>


                                    </div>


                                </div>

                            );

                        }

                    )}

                </div>

            )}


            {/* =================================================
                MODAL
            ================================================= */}

            <Modal

                open={showModal}

                title={
                    editingExpense
                        ? "Modifier la dépense"
                        : "Nouvelle dépense"
                }

                onClose={() => {

                    resetForm();

                    setShowModal(false);

                }}

            >


                <form

                    onSubmit={
                        handleSubmit
                    }

                    className="
                        space-y-5
                    "

                >


                    {/* DATE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Date de la dépense
                        </label>

                        <input

                            type="date"

                            value={
                                expenseDate
                            }

                            onChange={
                                e =>
                                    setExpenseDate(
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


                    {/* LIBELLE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Libellé
                        </label>

                        <input

                            type="text"

                            value={
                                label
                            }

                            onChange={
                                e =>
                                    setLabel(
                                        e.target.value
                                    )
                            }

                            placeholder="
                                Ex : Réparation plomberie
                            "

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* CATEGORIE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Catégorie
                        </label>

                        <select

                            value={
                                category
                            }

                            onChange={
                                e =>
                                    setCategory(
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
                                Choisir une catégorie
                            </option>

                            {categories.map(
                                item => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* MONTANT */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Montant
                        </label>

                        <input

                            type="number"

                            min="0"

                            value={
                                amount
                            }

                            onChange={
                                e =>
                                    setAmount(
                                        e.target.value
                                    )
                            }

                            placeholder="Ex : 25000"

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* MOYEN PAIEMENT */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Moyen de paiement
                        </label>

                        <select

                            value={
                                paymentMethod
                            }

                            onChange={
                                e =>
                                    setPaymentMethod(
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
                                Choisir
                            </option>

                            {paymentMethods.map(
                                item => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* BENEFICIAIRE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Bénéficiaire
                        </label>

                        <input

                            type="text"

                            value={
                                beneficiary
                            }

                            onChange={
                                e =>
                                    setBeneficiary(
                                        e.target.value
                                    )
                            }

                            placeholder="
                                Ex : Plombier Mamadou
                            "

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* REFERENCE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Référence
                        </label>

                        <input

                            type="text"

                            value={
                                reference
                            }

                            onChange={
                                e =>
                                    setReference(
                                        e.target.value
                                    )
                            }

                            placeholder="
                                Ex : FACT-2026-001
                            "

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        />

                    </div>


                    {/* IMMEUBLE */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Immeuble concerné
                        </label>

                        <select

                            value={
                                buildingId
                            }

                            onChange={e => {

                                setBuildingId(
                                    e.target.value
                                );

                                setApartmentId("");

                            }}

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                        >

                            <option value="">
                                Aucun immeuble
                            </option>

                            {buildings.map(
                                building => (

                                    <option
                                        key={
                                            building.id
                                        }
                                        value={
                                            building.id
                                        }
                                    >
                                        {building.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* APPARTEMENT */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Appartement concerné
                        </label>

                        <select

                            value={
                                apartmentId
                            }

                            onChange={
                                e =>
                                    setApartmentId(
                                        e.target.value
                                    )
                            }

                            className="
                                border
                                p-3
                                w-full
                                rounded-xl
                            "

                            disabled={
                                !buildingId
                            }

                        >

                            <option value="">
                                Aucun appartement
                            </option>

                            {apartments
                                .filter(
                                    apartment =>
                                        apartment.building_id ==
                                        buildingId
                                )
                                .map(
                                    apartment => (

                                        <option
                                            key={
                                                apartment.id
                                            }
                                            value={
                                                apartment.id
                                            }
                                        >
                                            Appartement{" "}
                                            {apartment.number}
                                        </option>

                                    )
                                )}

                        </select>

                    </div>


                    {/* DESCRIPTION */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Description
                        </label>

                        <textarea

                            value={
                                description
                            }

                            onChange={
                                e =>
                                    setDescription(
                                        e.target.value
                                    )
                            }

                            rows="3"

                            placeholder="
                                Détails supplémentaires...
                            "

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

                            variant="secondary"

                            onClick={() => {

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

                            variant="primary"

                        >

                            {editingExpense
                                ? "Enregistrer"
                                : "Créer"}

                        </Button>


                    </div>


                </form>


            </Modal>


        </Layout>

    );

}