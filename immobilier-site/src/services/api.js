const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export async function api(url, options = {}) {

    const response = await fetch(API_URL + url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(error.message || "Erreur API");

    }

    return response.json();

}