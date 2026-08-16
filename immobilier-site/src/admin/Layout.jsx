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
                                group
                                relative
                                flex
                                items-center
                                gap-3
                                px-3
                                py-2.5
                                rounded-2xl
                                border
                                border-blue-100
                                bg-blue-50
                                text-blue-700
                                shadow-sm
                                hover:border-red-200
                                hover:bg-red-50
                                hover:text-red-600
                                hover:shadow-md
                                active:scale-95
                                transition-all
                                duration-200
                            "
                        >
                            {/* Icône */}

                            <span
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-blue-100
                                    text-blue-700
                                    group-hover:bg-red-100
                                    group-hover:text-red-600
                                    transition-all
                                    duration-200
                                "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="
                                        w-5
                                        h-5
                                        transition-transform
                                        duration-200
                                        group-hover:translate-x-0.5
                                    "
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 12H9.75"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m15 9 3 3-3 3"
                                    />
                                </svg>
                            </span>

                            {/* Texte */}

                            <span
                                className="
                                    hidden
                                    lg:block
                                    text-sm
                                    font-semibold
                                    whitespace-nowrap
                                "
                            >
                                Déconnexion
                            </span>
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