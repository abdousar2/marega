import { api } from "./api";

const ExpensesService = {

    async getAll() {

        return api("/expenses");

    },

    async getById(id) {

        return api(`/expenses/${id}`);

    },

    async create(data) {

        return api("/expenses", {

            method: "POST",

            body: JSON.stringify(data)

        });

    },

    async update(id, data) {

        return api(`/expenses/${id}`, {

            method: "PUT",

            body: JSON.stringify(data)

        });

    },

    async delete(id) {

        return api(`/expenses/${id}`, {

            method: "DELETE"

        });

    }

};

export default ExpensesService;