import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {

    const {
        user,
        loading
    } = useAuth();

    if (loading) {

        return (
            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-slate-100
            ">
                <div className="
                    text-slate-600
                    font-medium
                ">
                    Vérification des autorisations...
                </div>
            </div>
        );

    }

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }

    if (user.role !== "ADMIN") {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );

    }

    return <Outlet />;

}