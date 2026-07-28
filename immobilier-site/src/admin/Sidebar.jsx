import { NavLink } from "react-router-dom";

export default function Sidebar() {

    const sections = [

        {

            title: "GESTION",

            items: [

                ["📊", "Tableau de bord", "/admin"],

                ["🏢", "Immeubles", "/admin/buildings"],

                ["🏠", "Appartements", "/admin/apartments"],

                ["👤", "Locataires", "/admin/tenants"],

                ["📄", "Contrats", "/admin/contracts"],

                ["📅", "Loyers", "/admin/rents"],

                ["💳", "Paiements", "/admin/payments"]

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

            <div className="h-24 flex flex-col justify-center items-center border-b border-slate-700">

                <h1 className="text-3xl font-bold">

                    MAREGA

                </h1>

                <p className="text-slate-400 text-sm">

                    ERP Immobilier

                </p>

            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">

                {

                    sections.map(section => (

                        <div

                            key={section.title}

                            className="mb-8"

                        >

                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">

                                {section.title}

                            </p>

                            {

                                section.items.map(([icon, label, url]) => (

                                    <NavLink

                                        key={url}

                                        to={url}

                                        end={url === "/admin"}

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

                                ))

                            }

                        </div>

                    ))

                }

            </div>

            <div className="border-t border-slate-700 p-5 text-center text-sm text-slate-400">

                Version 2.0

            </div>

        </aside>

    );

}