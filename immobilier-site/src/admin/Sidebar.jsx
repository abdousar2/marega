import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
    hasPermission
} from "../config/permissions";


export default function Sidebar({
    closeSidebar
}) {

    const { user } = useAuth();

    const role = user?.role;


    const sections = [

        {
            title: "GESTION IMMOBILIÈRE",

            items: [

                {
                    icon: "🏢",
                    label: "Immeubles",
                    url: "/admin/buildings",
                    module: "buildings"
                },

                {
                    icon: "🏠",
                    label: "Appartements",
                    url: "/admin/apartments",
                    module: "apartments"
                },

                {
                    icon: "👤",
                    label: "Locataires",
                    url: "/admin/tenants",
                    module: "tenants"
                },

                {
                    icon: "📄",
                    label: "Contrats",
                    url: "/admin/contracts",
                    module: "contracts"
                },

                {
                    icon: "📅",
                    label: "Loyers",
                    url: "/admin/rents",
                    module: "rents"
                }

            ]

        },

        {
            title: "FINANCES",

            items: [

                {
                    icon: "💳",
                    label: "Paiements",
                    url: "/admin/payments",
                    module: "payments"
                },

                {
                    icon: "💸",
                    label: "Dépenses",
                    url: "/admin/expenses",
                    module: "expenses"
                },

                {
                    icon: "📊",
                    label: "Situation financière",
                    url: "/admin/finance",
                    module: "finance"
                }

            ]

        },

        {
            title: "COMMUNICATION",

            items: [

                {
                    icon: "📩",
                    label: "Messages",
                    url: "/admin/messages",
                    module: "messages"
                }

            ]

        },

        {
            title: "ADMINISTRATION",

            items: [

                {
                    icon: "👥",
                    label: "Utilisateurs",
                    url: "/admin/users",
                    module: "users"
                },

                {
                    icon: "🛡️",
                    label: "Journal d'audit",
                    url: "/admin/audit",
                    module: "audit"
                }

            ]

        }

    ];


    return (

        <aside className="
            w-72
            bg-slate-900
            text-white
            flex
            flex-col
        ">


            {/* =====================================================
                LOGO
            ===================================================== */}

            <div className="
                h-28
                flex
                items-center
                justify-center
                border-b
                border-slate-700
                bg-blue
                p-3
            ">

                <img
                    src="/images/logo-ibm-marega.png"
                    alt="IBM MAREGA"
                    className="
                        w-72
                        h-28
                    "
                />

            </div>


            <br />


            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <div className="
                flex-1
                overflow-y-auto
                px-4
                py-6
            ">


                {/* =================================================
                    TABLEAU DE BORD
                ================================================= */}

                <div className="mb-8">

                    <NavLink
                        to="/admin"
                        end
                        onClick={() =>
                            closeSidebar?.()
                        }
                        className={({ isActive }) =>

                            `flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all

                            ${
                                isActive
                                    ? "bg-blue-600"
                                    : "hover:bg-slate-800"
                            }`

                        }
                    >

                        <span className="text-xl">
                            📊
                        </span>

                        <span>
                            Tableau de bord
                        </span>

                    </NavLink>

                </div>


                {/* =================================================
                    SECTIONS
                ================================================= */}

                {
                    sections.map(section => {

                        const visibleItems =
                            section.items.filter(
                                item =>
                                    hasPermission(
                                        role,
                                        item.module,
                                        "view"
                                    )
                            );


                        if (
                            visibleItems.length === 0
                        ) {

                            return null;

                        }


                        return (

                            <div
                                key={section.title}
                                className="mb-8"
                            >

                                <p className="
                                    text-xs
                                    uppercase
                                    tracking-widest
                                    text-slate-500
                                    mb-3
                                    px-2
                                ">

                                    {section.title}

                                </p>


                                {
                                    visibleItems.map(
                                        item => (

                                            <NavLink
                                                key={item.url}
                                                to={item.url}
                                                onClick={() =>
                                                    closeSidebar?.()
                                                }
                                                className={({
                                                    isActive
                                                }) =>

                                                    `flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all

                                                    ${
                                                        isActive
                                                            ? "bg-blue-600"
                                                            : "hover:bg-slate-800"
                                                    }`

                                                }
                                            >

                                                <span className="
                                                    text-xl
                                                ">

                                                    {item.icon}

                                                </span>


                                                <span>

                                                    {item.label}

                                                </span>

                                            </NavLink>

                                        )
                                    )
                                }

                            </div>

                        );

                    })
                }

            </div>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div className="
                border-t
                border-slate-700
                p-5
                text-right
                text-sm
                text-slate-400
            ">

                Copyright © 2026 TechTradiSport .

                <br />

                Powered by ArS

            </div>


        </aside>

    );

}