const PLATFORM_AUTH_KEY = "techtradisport_platform_token";
const PLATFORM_USER_KEY = "techtradisport_platform_user";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const PlatformAuthService = {

    async login(data) {

        const response = await fetch(
            `${API_URL}/platform/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Impossible de se connecter."
            );

        }


        localStorage.setItem(
            PLATFORM_AUTH_KEY,
            result.token
        );


        localStorage.setItem(
            PLATFORM_USER_KEY,
            JSON.stringify(result.user)
        );


        return result;

    },


    async me() {

        const token =
            localStorage.getItem(
                PLATFORM_AUTH_KEY
            );


        if (!token) {
            return null;
        }


        const response = await fetch(
            `${API_URL}/platform/auth/me`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                this.logout();

                return null;

            }


            throw new Error(
                "Impossible de vérifier la session."
            );

        }


        const user =
            await response.json();


        localStorage.setItem(
            PLATFORM_USER_KEY,
            JSON.stringify(user)
        );


        return user;

    },


    logout() {

        localStorage.removeItem(
            PLATFORM_AUTH_KEY
        );

        localStorage.removeItem(
            PLATFORM_USER_KEY
        );

    },


    getToken() {

        return localStorage.getItem(
            PLATFORM_AUTH_KEY
        );

    },


    getUser() {

        const user =
            localStorage.getItem(
                PLATFORM_USER_KEY
            );


        if (!user) {
            return null;
        }


        try {

            return JSON.parse(user);

        }

        catch {

            return null;

        }

    },


    isAuthenticated() {

        return !!localStorage.getItem(
            PLATFORM_AUTH_KEY
        );

    }

};


export default PlatformAuthService;