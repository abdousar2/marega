import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RentsService from "../../services/rents.service";
import { API_BASE } from "../../services/config";


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

import { useMemo } from "react";

import { TenantsContext } from "../../context/TenantsContext";
import { ContractsContext } from "../../context/ContractsContext";
import { PaymentsContext } from "../../context/PaymentsContext";
import { RentsContext } from "../../context/RentsContext";

import PaymentsService from "../../services/payments.service";

export default function Payments() {

    const { tenants } =
        useContext(TenantsContext);

    const { contracts } =
        useContext(ContractsContext);

    const {

        payments,
        loading,
        reloadPayments

    } = useContext(PaymentsContext);

    const {
        reloadRents
    } = useContext(RentsContext);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const rentId = searchParams.get("rent");

    const [selectedRent, setSelectedRent] = useState(null);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    console.log("Rent sélectionné :", rentId);

    const [tenantId, setTenantId] =
        useState("");

    const [month, setMonth] =
        useState("");

    const [paymentDate, setPaymentDate] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [method, setMethod] =
        useState("Espèces");   

    async function addPayment(e) {

        e.preventDefault();

        const lease = selectedRent
            ? { id: selectedRent.lease_id }
            : contracts.find(
                c =>
                    c.tenant_id == tenantId &&
                    c.status === "Actif"
            );

        try {

            const payment = await PaymentsService.create({

                tenant_id: Number(tenantId),

                lease_id: lease?.id || null,

                rent_id: rentId ? Number(rentId) : null,

                payment_month: month,

                payment_date: paymentDate,

                amount: Number(amount),

                payment_method: method,

                reference: "",

                status: "Payé",

                notes: ""

            });

            await reloadPayments();
            await reloadRents();
            if (payment.receipt_path) {

                window.open(

                    `${API_BASE}${payment.receipt_path}`,

                    "_blank"

                );

            }
            setShowModal(false);
            if (rentId) {

                navigate("/admin/rents?success=1");

            }

            setTenantId("");
            setMonth("");
            setPaymentDate("");
            setAmount("");
            setMethod("Espèces");            
            setSelectedRent(null);

        }

        catch (err) {

            console.error(err);

            alert("Impossible d'enregistrer le paiement.");

        }

    }

    useEffect(() => {

        if (!rentId) return;

        setShowModal(true);

        async function loadRent() {

            try {

                const rent = await RentsService.getById(rentId);

                setSelectedRent(rent);

                setTenantId(String(rent.tenant_id));

                setMonth(rent.due_month.substring(0, 10));

                setPaymentDate(
                    new Date()
                        .toISOString()
                        .substring(0, 10)
                );

                setAmount(String(rent.amount));

                setMethod("Espèces");                

            } catch (err) {

                console.error(err);

            }

        }

        loadRent();

    }, [rentId]);

    const totalPaid = payments
        .filter(p => p.status === "Payé")
        .reduce((s, p) => s + Number(p.amount), 0);

    const pendingPayments = payments.filter(
        p => p.status !== "Payé"
    );

    const filteredPayments = useMemo(() => {

        return payments.filter(payment => {

            const name =
                (payment.tenant_name || "")
                    .toLowerCase();

            return name.includes(
                search.toLowerCase()
            );

        });

    }, [payments, search]);

    if (loading) {

        return (

            <Layout>

                <h2>Chargement...</h2>

            </Layout>

        );

    }

    return (

        <Layout>

        <PageHeader
            title="Gestion des paiements"
            subtitle="Enregistrez les loyers et consultez l'historique."
            buttonLabel={rentId ? null : "+ Nouveau paiement"}
            onButtonClick={
                rentId
                    ? undefined
                    : () => {

                        setSelectedRent(null);

                        setTenantId("");

                        setMonth("");

                        setPaymentDate("");

                        setAmount("");

                        setMethod("Espèces");                        

                        setShowModal(true);

                    }
            }
        />
        <br></br>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <StatsCard
                title="Paiements"
                value={payments.length}
                color="blue"
            />

            <StatsCard
                title="Montant encaissé"
                value={totalPaid.toLocaleString()}
                color="green"
            />

            <StatsCard
                title="En attente"
                value={pendingPayments.length}
                color="orange"
            />

        </div>
        <br></br>

        <SearchBar
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Rechercher un paiement..."
        />
        <br></br><br></br>

        <Modal
            open={showModal}
            title={
                rentId
                    ? "Encaissement du loyer"
                    : "Nouveau paiement"
            }
            onClose={()=>setShowModal(false)}
        >

            <form
                onSubmit={addPayment}
                className="space-y-5"
            >            

                    <select
                        disabled={!!rentId}

                        value={tenantId}

                        onChange={(e)=>setTenantId(e.target.value)}

                        className="border p-3 rounded w-full mb-4"

                    >

                        <option value="">

                            Choisir un locataire

                        </option>

                        {

                            tenants.map(t=>(

                                <option

                                    key={t.id}

                                    value={t.id}

                                >

                                    {t.first_name} {t.last_name}

                                </option>

                            ))

                        }

                    </select>

                    <input
                        type="date"
                        readOnly={!!rentId}

                        value={month}

                        onChange={(e)=>setMonth(e.target.value)}

                        className="border p-3 rounded w-full mb-4"

                    />

                    <input

                        type="date"
                        readOnly={!!rentId}

                        value={paymentDate}

                        onChange={(e)=>setPaymentDate(e.target.value)}

                        className="border p-3 rounded w-full mb-4"

                    />

                    <input
                        type="number"
                        readOnly={!!rentId}

                        placeholder="Montant"

                        value={amount}

                        onChange={(e)=>setAmount(e.target.value)}

                        className="border p-3 rounded w-full mb-4"

                    />

                    <select

                        value={method}

                        onChange={(e)=>setMethod(e.target.value)}

                        className="border p-3 rounded w-full mb-4"

                    >

                        <option>Espèces</option>

                        <option>Wave</option>

                        <option>Orange Money</option>

                        <option>Virement</option>

                        <option>Chèque</option>

                    </select>

                    {rentId && (

                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                            <h3 className="font-semibold text-green-700">
                                Encaissement d'un loyer
                            </h3>

                            <p className="text-sm mt-2">

                                Le règlement de ce loyer sera enregistré comme
                                <strong> Payé</strong>.

                            </p>

                        </div>

                    )}

                    <div className="flex justify-end gap-3 pt-4">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {

                            setShowModal(false);

                            if (rentId) {

                                navigate("/admin/rents");

                            }

                        }}
                        >
                            Annuler
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                        >
                            {rentId ? "💳 Encaisser le loyer" : "Enregistrer"}
                        </Button>

                    </div>

            </form>

        </Modal>
            

            <div className="grid gap-6 mt-8">

                {filteredPayments.length === 0 ? (

                    <Empty
                        title="Aucun paiement"
                        subtitle="Aucun paiement ne correspond à votre recherche."
                    />

                ) : (
                    filteredPayments.map(payment => (

                        <div

                            key={payment.id}

                            onClick={() =>
                                navigate(`/admin/payments/${payment.id}`)
                            }

                            className="
                                bg-white
                                rounded-xl
                                shadow
                                p-5
                                cursor-pointer
                                hover:shadow-lg
                                hover:-translate-y-1
                                transition-all
                            "

                        >

                            <h2 className="font-bold text-xl">

                                {payment.tenant_name}

                            </h2>

                            <p>Mois : {payment.payment_month}</p>

                            <p>Montant : {Number(payment.amount).toLocaleString()} FCFA</p>

                            <p>Mode : {payment.payment_method}</p>

                            <span
                                className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold ${
                                    payment.status === "Payé"
                                        ? "bg-green-100 text-green-700"
                                        : payment.status === "En attente"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {payment.status}
                            </span>

                            {payment.receipt_path && (

                                <a

                                    href={`${API_BASE}${payment.receipt_path}`}

                                    target="_blank"

                                    rel="noreferrer"

                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }

                                    className="
                                        inline-block
                                        mt-4
                                        bg-green-600
                                        text-white
                                        px-4
                                        py-2
                                        rounded
                                    "

                                >
                                    📄 Télécharger la quittance
                                </a>

                            )}

                        </div>

                    ))

                )}

            </div>

        </Layout>

    );

}