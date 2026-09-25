const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const AUTH_KEY =
    "marega_token";

const USER_KEY =
    "marega_user";


export const SESSION_EXPIRED_EVENT =
    "marega:session-expired";


function clearSessionAndNotify() {

    localStorage.removeItem(
        AUTH_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );


    window.dispatchEvent(
        new Event(
            SESSION_EXPIRED_EVENT
        )
    );

}


export async function api(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(
            AUTH_KEY
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


    let errorData = null;


    if (!response.ok) {

        try {

            errorData =
                await response.json();

        }

        catch {

            errorData = {};

        }


        // =====================================================
        // SESSION RÉVOQUÉE / EXPIRÉE
        // =====================================================

        if (
            response.status === 401
        ) {

            clearSessionAndNotify();

        }


        const error =
            new Error(

                errorData.error ||
                errorData.message ||
                "Erreur API"

            );


        // Conserver les informations
        // pour les composants appelants.

        error.status =
            response.status;


        error.data =
            errorData;


        error.response =
            response;


        throw error;

    }


    return response.json();

}