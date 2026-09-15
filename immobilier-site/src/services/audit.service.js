import { api } from "./api";

const AuditService = {

    getAll() {

        return api("/audit");

    }

};

export default AuditService;