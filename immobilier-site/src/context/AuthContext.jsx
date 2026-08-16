import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import AuthService from "../services/auth.service";

export const AuthContext =
    createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // =========================================================
    // RESTAURATION DE LA SESSION
    // =========================================================

    useEffect(() => {

        async function restoreSession() {

            const token =
                localStorage.getItem(
                    "marega_token"
                );

            if (!token) {

                setLoading(false);

                return;

            }


            try {

                const currentUser =
                    await AuthService.me();

                setUser(currentUser);

            }

            catch (err) {

                console.error(
                    "Session invalide :",
                    err
                );

                localStorage.removeItem(
                    "marega_token"
                );

                setUser(null);

            }

            finally {

                setLoading(false);

            }

        }


        restoreSession();

    }, []);


    // =========================================================
    // CONNEXION
    // =========================================================

    const login = async (
        email,
        password
    ) => {

        const result =
            await AuthService.login(
                email,
                password
            );


        localStorage.setItem(
            "marega_token",
            result.token
        );


        setUser(result.user);


        return result;

    };


    // =========================================================
    // DECONNEXION
    // =========================================================

    const logout = () => {

        AuthService.logout();

        setUser(null);

    };


    // =========================================================
    // CONTEXTE
    // =========================================================

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated:
                    !!user
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


// =========================================================
// HOOK
// =========================================================

export function useAuth() {

    return useContext(
        AuthContext
    );

}