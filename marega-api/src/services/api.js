const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export async function api(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(
            "marega_token"
        );


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(

            API_URL + url,

            {
                ...options,

                headers

            }

        );


    if (!response.ok) {

        let errorData = {};

        try {

            errorData =
                await response.json();

        }

        catch {

            errorData = {};

        }


        const error =
            new Error(

                errorData.error ||
                errorData.message ||
                `Erreur API (${response.status})`

            );


        // =====================================================
        // INFORMATIONS HTTP CONSERVÉES
        // =====================================================

        error.status =
            response.status;


        error.data =
            errorData;


        throw error;

    }


    return response.json();

}