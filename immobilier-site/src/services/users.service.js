import { api } from "./api";

const UsersService = {

    getAll() {

        return api("/users");

    },

    getById(id) {

        return api(`/users/${id}`);

    },

    create(data) {

        return api("/users", {

            method: "POST",

            body: JSON.stringify(data)

        });

    },

    update(id, data) {

        return api(`/users/${id}`, {

            method: "PUT",

            body: JSON.stringify(data)

        });

    },

    updatePassword(id, password) {

        return api(`/users/${id}/password`, {

            method: "PUT",

            body: JSON.stringify({
                password
            })

        });

    },

    updateActive(id, active) {

        return api(`/users/${id}/status`, {

            method: "PUT",

            body: JSON.stringify({
                active
            })

        });

    },

    remove(id) {

        return api(`/users/${id}`, {

            method: "DELETE"

        });

    }

};

export default UsersService;