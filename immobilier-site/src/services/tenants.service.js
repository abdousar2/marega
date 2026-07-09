import { api } from "./api";

const TenantsService = {

    getAll() {

        return api("/tenants");

    },

    create(tenant) {

        return api("/tenants", {

            method: "POST",

            body: JSON.stringify(tenant)

        });

    },

    update(id, tenant) {

        return api(`/tenants/${id}`, {

            method: "PUT",

            body: JSON.stringify(tenant)

        });

    },

    remove(id) {

        return api(`/tenants/${id}`, {

            method: "DELETE"

        });

    }

};

export default TenantsService;