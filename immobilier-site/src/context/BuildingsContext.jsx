import { createContext, useEffect, useState } from "react";
import BuildingsService from "../services/buildings.service";

export const BuildingsContext = createContext();

export default function BuildingsProvider({ children }) {

    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadBuildings() {

        try {

            const data = await BuildingsService.getAll();

            setBuildings(data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadBuildings();

    }, []);

    return (
        <BuildingsContext.Provider
            value={{
                buildings,
                setBuildings,
                loading,
                reloadBuildings: loadBuildings
            }}
        >
            {children}
        </BuildingsContext.Provider>
    );

}