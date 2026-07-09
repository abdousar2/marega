import { createContext, useEffect, useState } from "react";
import LeasesService from "../services/leases.service";

export const ContractsContext = createContext();

export function ContractsProvider({ children }) {

    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const reloadContracts = async () => {

        try {

            setLoading(true);

            const data = await LeasesService.getAll();

            setContracts(data);

        }

        catch (err) {

            console.error("Erreur chargement contrats :", err);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        reloadContracts();

    }, []);

    return (

        <ContractsContext.Provider
            value={{
                contracts,
                loading,
                reloadContracts
            }}
        >

            {children}

        </ContractsContext.Provider>

    );

}

export default ContractsProvider;