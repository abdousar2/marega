import { api } from "./api";


const FinanceService = {

    getReport(params = {}) {

        const query =
            new URLSearchParams(
                params
            ).toString();


        return api(
            `/finance/report?${query}`
        );

    }

};


export default FinanceService;