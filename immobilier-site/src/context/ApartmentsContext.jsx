import { createContext, useEffect, useState } from "react";
import ApartmentsService from "../services/apartments.service";

export const ApartmentsContext = createContext();

export default function ApartmentsProvider({ children }) {

    const [apartments, setApartments] = useState([]);

    const [loading, setLoading] = useState(true);

    async function loadApartments() {

        try {

            const data = await ApartmentsService.getAll();

            setApartments(data);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadApartments();

    }, []);

    return (

        <ApartmentsContext.Provider
            value={{
                apartments,
                loading,
                reloadApartments: loadApartments
            }}
        >

            {children}

        </ApartmentsContext.Provider>

    );

}