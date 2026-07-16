import { api } from "./api";

const PaymentsService = {

    getAll() {

        return api("/payments");

    },

    getById(id) {

        return api(`/payments/${id}`);

    },

    create(data) {

        return api("/payments", {

            method: "POST",

            body: JSON.stringify(data)

        });

    },

    update(id, data) {

        return api(`/payments/${id}`, {

            method: "PUT",

            body: JSON.stringify(data)

        });

    },

    remove(id) {

        return api(`/payments/${id}`, {

            method: "DELETE"

        });

    }

};

export default PaymentsService;