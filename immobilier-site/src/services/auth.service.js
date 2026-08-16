const AUTH_KEY = "marega_token";
const USER_KEY = "marega_user";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const AuthService = {

    async login(data) {

        const response = await fetch(
            `${API_URL}/auth/login`,
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
                "Identifiants incorrects."
            );

        }


        localStorage.setItem(
            AUTH_KEY,
            result.token
        );


        localStorage.setItem(
            USER_KEY,
            JSON.stringify(result.user)
        );


        return result;

    },


    async me() {

        const token =
            localStorage.getItem(AUTH_KEY);


        if (!token) {

            return null;

        }


        const response = await fetch(
            `${API_URL}/auth/me`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",

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
            USER_KEY,
            JSON.stringify(user)
        );


        return user;

    },


    logout() {

        localStorage.removeItem(AUTH_KEY);

        localStorage.removeItem(USER_KEY);

    },


    getToken() {

        return localStorage.getItem(
            AUTH_KEY
        );

    },


    getUser() {

        const user =
            localStorage.getItem(USER_KEY);


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
            AUTH_KEY
        );

    }

};


export default AuthService;