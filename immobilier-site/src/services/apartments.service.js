import { api } from "./api";

const ApartmentsService = {

    getAll() {

        return api("/apartments");

    },

    create(apartment) {

        return api("/apartments", {

            method: "POST",

            body: JSON.stringify(apartment)

        });

    },

    update(id, apartment) {

        return api(`/apartments/${id}`, {

            method: "PUT",

            body: JSON.stringify(apartment)

        });

    },

    remove(id) {

        return api(`/apartments/${id}`, {

            method: "DELETE"

        });

    }

};

export default ApartmentsService;