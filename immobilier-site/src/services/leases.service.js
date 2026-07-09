import { api } from "./api";

const LeasesService = {

    getAll() {

        return api("/leases");

    },

    getById(id) {

        return api(`/leases/${id}`);

    },

    create(lease) {

        return api("/leases", {
            method: "POST",
            body: JSON.stringify(lease)
        });

    },

    update(id, lease) {

        return api(`/leases/${id}`, {
            method: "PUT",
            body: JSON.stringify(lease)
        });

    },

    remove(id) {

        return api(`/leases/${id}`, {
            method: "DELETE"
        });

    }

};

export default LeasesService;