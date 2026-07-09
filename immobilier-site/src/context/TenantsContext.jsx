import { createContext, useEffect, useState } from "react";
import TenantsService from "../services/tenants.service";

export const TenantsContext = createContext();

export default function TenantsProvider({ children }) {

    const [tenants, setTenants] = useState([]);

    const [loading, setLoading] = useState(true);

    async function reloadTenants() {

        try {

            const data = await TenantsService.getAll();

            setTenants(data);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        reloadTenants();

    }, []);

    return (

        <TenantsContext.Provider

            value={{

                tenants,

                setTenants,

                loading,

                reloadTenants

            }}

        >

            {children}

        </TenantsContext.Provider>

    );

}