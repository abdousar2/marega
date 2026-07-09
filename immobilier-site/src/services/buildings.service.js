import { api } from "./api";

const BuildingsService = {

    getAll() {

        return api("/buildings");

    },

    create(building) {

        return api("/buildings", {
            method: "POST",
            body: JSON.stringify(building)
        });

    },

    async update(id, building) {

    return api(`/buildings/${id}`, {
        method: "PUT",
        body: JSON.stringify(building)
    });

},

async remove(id) {

    return api(`/buildings/${id}`, {
        method: "DELETE"
    });

}

};

export default BuildingsService;