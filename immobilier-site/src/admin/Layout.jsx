import { useState } from "react";

import Sidebar from "./Sidebar";

import AuthService from "../services/auth.service";

export default function Layout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = AuthService.getUser();

    function handleLogout() {

        AuthService.logout();

        window.location.href = "/";

    }

    const initials =
        user
            ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`
                .toUpperCase()
            : "U";

    return (

        <div className="h-screen bg-slate-100 flex">

            {/* =====================================================
                SIDEBAR DESKTOP
            ====================================================== */}

            <div className="hidden lg:flex">

                <Sidebar />

            </div>


            {/* =====================================================
                SIDEBAR MOBILE
            ====================================================== */}

            {sidebarOpen && (

                <div className="fixed inset-0 z-50 flex">

                    <div className="w-72">

                        <Sidebar
                            closeSidebar={() =>
                                setSidebarOpen(false)
                            }
                        />

                    </div>

                    <div
                        className="flex-1 bg-black/50"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                    />

                </div>

            )}


            {/* =====================================================
                CONTENU PRINCIPAL
            ====================================================== */}

            <div className="flex-1 flex flex-col overflow-hidden">


                {/* =================================================
                    HEADER
                ================================================== */}

                <header className="
                    h-16
                    lg:h-20
                    bg-white
                    border-b
                    border-slate-200
                    shadow-sm
                    flex
                    items-center
                    justify-between
                    px-4
                    lg:px-10
                ">


                    {/* GAUCHE */}

                    <div className="flex items-center gap-4">


                        {/* Hamburger */}

                        <button
                            className="lg:hidden text-3xl"
                            onClick={() =>
                                setSidebarOpen(true)
                            }
                        >
                            ☰
                        </button>


                        <div>

                            <h1 className="
                                text-2xl
                                font-bold
                                text-slate-800
                            ">
                                IBM MAREGA
                            </h1>

                            <p className="
                                text-sm
                                text-slate-500
                            ">
                                Agence Immobilière • Gestion locative
                            </p>

                        </div>

                    </div>


                    {/* DROITE */}

                    <div className="
                        flex
                        items-center
                        gap-4
                        lg:gap-6
                    ">


                        {/* Notifications */}

                        <button
                            className="
                                text-xl
                                lg:text-2xl
                                hover:scale-110
                                transition
                            "
                        >
                            🔔
                        </button>


                        {/* UTILISATEUR */}

                        <div className="
                            hidden
                            sm:flex
                            items-center
                            gap-3
                        ">

                            <div className="text-right">

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                ">
                                    {user
                                        ? `${user.first_name} ${user.last_name}`
                                        : "Utilisateur"
                                    }
                                </p>

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">
                                    {user?.role || "Utilisateur"}
                                </p>

                            </div>


                            <div className="
                                w-10
                                h-10
                                rounded-full
                                bg-blue-600
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                            ">

                                {initials}

                            </div>

                        </div>


                        {/* DÉCONNEXION */}

                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Se déconnecter"
                            className="
                                text-slate-500
                                hover:text-red-600
                                transition
                                text-xl
                            "
                        >
                            ⏻
                        </button>

                    </div>

                </header>


                {/* =================================================
                    CONTENU
                ================================================== */}

                <main className="flex-1 overflow-y-auto">

                    <div className="
                        max-w-7xl
                        mx-auto
                        py-5
                        lg:py-10
                        px-4
                        lg:px-10
                    ">

                        {children}

                    </div>

                </main>

            </div>

        </div>

    );

}