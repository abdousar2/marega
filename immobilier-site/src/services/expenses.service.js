import { API_BASE } from "./config";

const ExpensesService = {

    async getAll() {

        const response = await fetch(
            `${API_BASE}/api/expenses`
        );

        if (!response.ok) {
            throw new Error(
                "Erreur lors du chargement des dépenses."
            );
        }

        return response.json();

    },

    async getById(id) {

        const response = await fetch(
            `${API_BASE}/api/expenses/${id}`
        );

        if (!response.ok) {
            throw new Error(
                "Dépense introuvable."
            );
        }

        return response.json();

    },

    async create(data) {

        const response = await fetch(
            `${API_BASE}/api/expenses`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {

            const error =
                await response.json().catch(() => ({}));

            throw new Error(
                error.error ||
                "Erreur lors de l'enregistrement de la dépense."
            );

        }

        return response.json();

    },

    async update(id, data) {

        const response = await fetch(
            `${API_BASE}/api/expenses/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {

            const error =
                await response.json().catch(() => ({}));

            throw new Error(
                error.error ||
                "Erreur lors de la mise à jour."
            );

        }

        return response.json();

    },

    async delete(id) {

        const response = await fetch(
            `${API_BASE}/api/expenses/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const error =
                await response.json().catch(() => ({}));

            throw new Error(
                error.error ||
                "Erreur lors de la suppression."
            );

        }

        return response.json();

    }

};

export default ExpensesService;