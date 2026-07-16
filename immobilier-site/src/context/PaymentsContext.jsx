import {
    createContext,
    useEffect,
    useState
} from "react";

import PaymentsService
    from "../services/payments.service";

export const PaymentsContext =
    createContext();

export default function PaymentsProvider({

    children

}) {

    const [payments, setPayments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    async function reloadPayments() {

        try {

            const data =
                await PaymentsService.getAll();

            setPayments(data);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        reloadPayments();

    }, []);

    return (

        <PaymentsContext.Provider

            value={{

                payments,
                loading,
                reloadPayments

            }}

        >

            {children}

        </PaymentsContext.Provider>

    );

}