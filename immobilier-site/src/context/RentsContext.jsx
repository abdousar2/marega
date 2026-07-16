import { createContext, useEffect, useState } from "react";
import RentsService from "../services/rents.service";

export const RentsContext = createContext();

export default function RentsProvider({ children }) {

    const [rents, setRents] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadRents() {

        try {
            const data = await RentsService.getAll();
            setRents(data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        loadRents();
    }, []);

    return (
        <RentsContext.Provider value={{ rents, loading, reloadRents: loadRents }}>
            {children}
        </RentsContext.Provider>
    );
}