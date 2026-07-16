import { NavLink } from "react-router-dom";

export default function Sidebar() {

    const menu = [

        {
            label: "Tableau de bord",
            icon: "📊",
            url: "/admin"
        },

        {
            label: "Immeubles",
            icon: "🏢",
            url: "/admin/buildings"
        },

        {
            label: "Appartements",
            icon: "🏠",
            url: "/admin/apartments"
        },

        {
            label: "Locataires",
            icon: "👤",
            url: "/admin/tenants"
        },

        {
            label: "Contrats",
            icon: "📄",
            url: "/admin/contracts"
        },

        {
            label: "Loyers",
            icon: "📅",
            url: "/admin/rents"
        },

        {
            label: "Paiements",
            icon: "💳",
            url: "/admin/payments"
        },

        {
            label: "Messages",
            icon: "📩",
            url: "/admin/messages"
        }

    ];

    return (

        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-xl">

            {/* Logo */}

            <div className="h-24 flex flex-col items-center justify-center border-b border-slate-700">

                <div className="text-3xl font-extrabold tracking-wider">

                    MAREGA

                </div>

                <div className="text-sm text-slate-400">

                    Gestion Immobilière

                </div>

            </div>

            {/* Menu */}

            <nav className="flex-1 mt-6">

                {

                    menu.map(item => (

                        <NavLink

                            key={item.url}

                            to={item.url}

                            end={item.url === "/admin"}

                            className={({ isActive }) =>

                                `flex items-center gap-4 mx-4 my-2 px-4 py-3 rounded-xl transition-all duration-200

                                ${

                                    isActive

                                    ? "bg-blue-600 shadow-lg"

                                    : "hover:bg-slate-800"

                                }`

                            }

                        >

                            <span className="text-xl">

                                {item.icon}

                            </span>

                            <span>

                                {item.label}

                            </span>

                        </NavLink>

                    ))

                }

            </nav>

            {/* Footer */}

            <div className="border-t border-slate-700 p-5">

                <div className="text-sm text-slate-400">

                    MAREGA ERP

                </div>

                <div className="text-xs text-slate-500 mt-1">

                    Version 1.0

                </div>

            </div>

        </aside>

    );

}