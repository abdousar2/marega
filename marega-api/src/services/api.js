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

        let error;

        try {

            error =
                await response.json();

        }

        catch {

            error = {};

        }


        throw new Error(

            error.error ||
            error.message ||
            "Erreur API"

        );

    }


    return response.json();

}