import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RentsService from "../../services/rents.service";

import Layout from "../Layout";

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

    const [status, setStatus] =
        useState("Payé");

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

            await PaymentsService.create({

                tenant_id: Number(tenantId),

                lease_id: lease?.id || null,

                rent_id: rentId ? Number(rentId) : null,

                payment_month: month,

                payment_date: paymentDate,

                amount: Number(amount),

                payment_method: method,

                reference: "",

                status,

                notes: ""

            });

            await reloadPayments();
            await reloadRents();
            if (rentId) {

                navigate("/admin/rents");

            }

            setTenantId("");
            setMonth("");
            setPaymentDate("");
            setAmount("");
            setMethod("Espèces");
            setStatus("Payé");
            setSelectedRent(null);

        }

        catch (err) {

            console.error(err);

            alert("Impossible d'enregistrer le paiement.");

        }

    }

    useEffect(() => {

        if (!rentId) return;

        async function loadRent() {

            try {

                const rent =
                    await RentsService.getById(rentId);

                setSelectedRent(rent);

                setTenantId(
                    String(rent.tenant_id)
                );

                setMonth(
                    rent.due_month.substring(0,10)
                );

                setPaymentDate(
                    new Date()
                        .toISOString()
                        .substring(0,10)
                );

                setAmount(
                    rent.amount
                );

            }

            catch(err){

                console.error(err);

            }

        }

        loadRent();

    }, [rentId]);

    if (loading) {

        return (

            <Layout>

                <h2>Chargement...</h2>

            </Layout>

        );

    }

    return (

        <Layout>

            <h1 className="text-4xl font-bold mb-8">

                Paiements des loyers

            </h1>

            <form

                onSubmit={addPayment}

                className="bg-white rounded-xl shadow p-6 mb-8"

            >

                <select

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

                    value={month}

                    onChange={(e)=>setMonth(e.target.value)}

                    className="border p-3 rounded w-full mb-4"

                />

                <input

                    type="date"

                    value={paymentDate}

                    onChange={(e)=>setPaymentDate(e.target.value)}

                    className="border p-3 rounded w-full mb-4"

                />

                <input

                    type="number"

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

                <select

                    value={status}

                    onChange={(e)=>setStatus(e.target.value)}

                    className="border p-3 rounded w-full mb-6"

                >

                    <option>Payé</option>

                    <option>En attente</option>

                    <option>En retard</option>

                </select>

                <button

                    className="bg-yellow-600 text-white px-6 py-3 rounded"

                >

                    Enregistrer le paiement

                </button>

            </form>

            <div className="grid gap-6">

                {

                    payments.map(payment=>(

                        <div

                            key={payment.id}

                            className="bg-white rounded-xl shadow p-5"

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
                                    href={`http://localhost:5000${payment.receipt_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    📄 Télécharger la quittance
                                </a>

                            )}

                        </div>

                    ))

                }

            </div>

        </Layout>

    );

}