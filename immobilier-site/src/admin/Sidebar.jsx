import { NavLink } from "react-router-dom";

export default function Sidebar({ closeSidebar }) {

    const sections = [

        {
            title: "GESTION IMMOBILIÈRE",

            items: [

                ["🏢", "Immeubles", "/admin/buildings"],

                ["🏠", "Appartements", "/admin/apartments"],

                ["👤", "Locataires", "/admin/tenants"],

                ["📄", "Contrats", "/admin/contracts"],

                ["📅", "Loyers", "/admin/rents"]
                

            ]

        },

        {
            title: "FINANCES",

            items: [

                ["💳", "Paiements", "/admin/payments"],

                ["💸", "Dépenses", "/admin/expenses"]

            ]

        },

        {
            title: "COMMUNICATION",

            items: [

                ["📩", "Messages", "/admin/messages"]

            ]

        }

    ];

    return (

        <aside className="w-72 bg-slate-900 text-white flex flex-col">

            {/* LOGO */}
            <div className="h-28 flex items-center justify-center border-b border-slate-700 bg-blue p-3">

                <img
                    src="/images/logo-ibm-marega.png"
                    alt="IBM MAREGA"
                    className="w-72 h-28"
                />

            </div>
            <br></br>


            {/* NAVIGATION */}
            <div className="flex-1 overflow-y-auto px-4 py-6">

                {/* TABLEAU DE BORD */}
                <div className="mb-8">

                    <NavLink

                        to="/admin"

                        end

                        onClick={() => closeSidebar?.()}

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


                {/* SECTIONS */}
                {

                    sections.map(section => (

                        <div

                            key={section.title}

                            className="mb-8"

                        >

                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 px-2">

                                {section.title}

                            </p>


                            {

                                section.items.map(
                                    ([icon, label, url]) => (

                                        <NavLink

                                            key={url}

                                            to={url}

                                            onClick={() => closeSidebar?.()}

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

                                                {icon}

                                            </span>

                                            <span>

                                                {label}

                                            </span>

                                        </NavLink>

                                    )
                                )

                            }

                        </div>

                    ))

                }

            </div>


            {/* FOOTER */}
            <div className="border-t border-slate-700 p-5 text-center text-sm text-slate-400">

                Version 2.0

            </div>

        </aside>

    );

}