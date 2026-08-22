import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {

    const links = [
        {
            label: "Accueil",
            to: "/"
        },
        {
            label: "La solution",
            to: "/solution"
        },
        {
            label: "Fonctionnalités",
            to: "/fonctionnalites"
        },
        {
            label: "Référence",
            to: "/reference"
        },
        {
            label: "Contact",
            to: "/contact"
        }
    ];

    return (
        <header className="navbar">

            <div className="navbar-container">

                {/* LOGO */}
                <NavLink
                    to="/"
                    className="navbar-logo"
                >
                    <span className="navbar-logo-name">
                        TECHTRADISPORT
                    </span>

                    <span className="navbar-logo-subtitle">
                        Solutions immobilières
                    </span>
                </NavLink>


                {/* NAVIGATION */}
                <nav className="navbar-links">

                    {links.map((link) => (

                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/"}
                            className={({ isActive }) =>
                                isActive
                                    ? "navbar-link active"
                                    : "navbar-link"
                            }
                        >
                            {link.label}
                        </NavLink>

                    ))}

                </nav>


                {/* ACTIONS */}
                <div className="navbar-actions">

                    <NavLink
                        to="/connexion"
                        className="navbar-login"
                    >
                        Se connecter
                    </NavLink>

                    <NavLink
                        to="/contact"
                        className="navbar-demo"
                    >
                        Demander une démo
                    </NavLink>

                </div>

            </div>

        </header>
    );
}