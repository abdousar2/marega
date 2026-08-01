const API_URL = "https://marega.onrender.com/api/rents";

const RentsService = {

    async getAll() {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des loyers");
        }

        return response.json();

    },

    async getById(id) {

        const res = await fetch(

            `https://marega.onrender.com/api/rents/${id}`

        );

        if (!res.ok)

            throw new Error("Impossible de charger le loyer");

        return await res.json();

    },

    async getPending() {

        const response = await fetch(`${API_URL}/pending`);

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des loyers en attente");
        }

        return response.json();

    },

    async getLate() {

        const response = await fetch(`${API_URL}/late`);

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des loyers en retard");
        }

        return response.json();

    }

};

export default RentsService;