import { api } from "./api";

const RentsService = {

    getAll() {
        return api("/rents");
    },

    getById(id) {
        return api(`/rents/${id}`);
    },

    getPending() {
        return api("/rents/pending");
    },

    getLate() {
        return api("/rents/late");
    }

};

export default RentsService;