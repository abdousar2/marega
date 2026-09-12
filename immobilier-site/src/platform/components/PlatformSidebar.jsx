import { NavLink } from "react-router-dom";

import logoArs from "../../assets/branding/logo-ars.png";

import "../styles/platform-sidebar.css";


export default function PlatformSidebar() {

    const links = [

        {
            label: "Vue d'ensemble",
            path: "/platform"
        },

        {
            label: "Agences",
            path: "/platform/agencies"
        },

        {
            label: "Modèles IA",
            path: "/platform/document-templates"
        },

        {
            label: "Demandes",
            path: "/platform/requests"
        },

        {
            label: "Utilisateurs",
            path: "/platform/users"
        },

        {
            label: "Activité",
            path: "/platform/activity"
        }

    ];


    return (

        <aside className="platform-sidebar">


            {/* =================================================
                IDENTITÉ
            ================================================= */}

            <div className="platform-sidebar-brand">

                <img
                    src={logoArs}
                    alt="ArS"
                    className="platform-sidebar-ars-logo"
                />

                <div className="platform-sidebar-brand-separator" />

                <div className="platform-sidebar-brand-info">

                    <p className="platform-sidebar-brand-name">
                        TECHTRADISPORT
                    </p>

                    <p className="platform-sidebar-brand-subtitle">
                        Administration
                    </p>

                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="platform-sidebar-nav">

                {links.map((link) => (

                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === "/platform"}
                        className={({ isActive }) =>
                            `platform-sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        {link.label}

                    </NavLink>

                ))}

            </nav>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="platform-sidebar-footer">

                <p className="platform-sidebar-copyright">
                    Copyright © 2026 TechTradiSport
                </p>

                <p className="platform-sidebar-powered">
                    Powered by <strong>ArS</strong>
                </p>

            </div>


        </aside>

    );

}