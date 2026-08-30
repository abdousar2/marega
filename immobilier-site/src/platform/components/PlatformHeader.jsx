import { useNavigate } from "react-router-dom";

import PlatformAuthService
    from "../../services/platformAuth.service";

import "../styles/platform-header.css";


export default function PlatformHeader() {

    const navigate = useNavigate();

    const user =
        PlatformAuthService.getUser();


    function handleLogout() {

        PlatformAuthService.logout();

        navigate(
            "/platform/login",
            { replace: true }
        );

    }


    return (

        <header className="platform-header">


            {/* =================================================
                IDENTITÉ DE LA PAGE
            ================================================= */}

            <div className="platform-header-title">

                <p>
                    Administration plateforme
                </p>

                <h1>
                    TECHTRADISPORT
                </h1>

            </div>


            {/* =================================================
                UTILISATEUR
            ================================================= */}

            <div className="platform-header-user">

                <div className="platform-header-user-info">

                    <p className="platform-header-user-name">

                        {user?.first_name}{" "}

                        {user?.last_name}

                    </p>

                    <p className="platform-header-user-role">
                        Administrateur plateforme
                    </p>

                </div>


                {/* =================================================
                    DÉCONNEXION
                ================================================= */}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="platform-header-logout"
                >
                    Déconnexion
                </button>

            </div>

        </header>

    );

}