import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import AuthService from "../../services/auth.service";

export default function Login() {

    const navigate = useNavigate();


    /* =========================================================
       AGENCE SÉLECTIONNÉE
    ========================================================= */

    const [agency] = useState(() => {

        try {

            const storedAgency =
                sessionStorage.getItem(
                    "techtradisport_selected_agency"
                );

            if (!storedAgency) {
                return null;
            }

            return JSON.parse(storedAgency);

        } catch (error) {

            console.error(
                "Erreur récupération agence :",
                error
            );

            sessionStorage.removeItem(
                "techtradisport_selected_agency"
            );

            return null;

        }

    });


    /* =========================================================
       FORMULAIRE
    ========================================================= */

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");   

    const handleChangeAgency = () => {

        sessionStorage.removeItem(
            "techtradisport_selected_agency"
        );

        navigate("/connexion");
    };


    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            if (!agency?.id) {

                setError(
                    "Veuillez d'abord sélectionner votre agence."
                );

                return;

            }

            await AuthService.login({

                email,

                password,

                agency_id: agency.id

            });

            navigate("/admin");

        }

        catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Impossible de se connecter."
            );

        }

        finally {

            setLoading(false);

        }

    }

    if (!agency) {

        return (

            <div className="
                min-h-screen
                bg-slate-950
                flex
                items-center
                justify-center
                px-6
            ">

                <div className="
                    w-full
                    max-w-md
                    bg-white
                    rounded-3xl
                    p-8
                    text-center
                    shadow-2xl
                ">

                    <div className="
                        w-16
                        h-16
                        mx-auto
                        mb-6
                        rounded-2xl
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-2xl
                        font-black
                    ">
                        M
                    </div>

                    <h1 className="
                        text-2xl
                        font-bold
                        text-slate-900
                        mb-3
                    ">
                        Sélectionnez votre agence
                    </h1>

                    <p className="
                        text-slate-500
                        mb-8
                    ">
                        Vous devez sélectionner votre agence
                        avant de vous connecter.
                    </p>

                    <NavLink
                        to="/connexion"
                        className="
                            inline-flex
                            items-center
                            justify-center
                            w-full
                            h-14
                            rounded-2xl
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            font-semibold
                            transition
                        "
                    >
                        Choisir mon agence
                    </NavLink>

                </div>

            </div>

        );

    }


    return (
    <div className="
        min-h-screen
        bg-slate-950
        flex
        flex-col
        xl:flex-row
    ">

        {/* =====================================================
            PANNEAU GAUCHE
        ====================================================== */}

        <div className="
            relative
            hidden
            md:flex
            xl:w-[55%]
            min-h-[420px]
            xl:min-h-screen
            flex-col
            justify-between
            overflow-hidden
            bg-gradient-to-br
            from-blue-950
            via-blue-900
            to-slate-950
            text-white
            px-10
            py-10
            lg:px-16
            lg:py-14
            xl:px-20
            xl:py-16
        ">

            {/* Décorations */}

            <div className="
                absolute
                -top-32
                -left-32
                w-[500px]
                h-[500px]
                rounded-full
                bg-blue-500/10
            " />

            <div className="
                absolute
                -bottom-40
                -right-40
                w-[600px]
                h-[600px]
                rounded-full
                bg-blue-400/10
            " />

            <div className="
                absolute
                top-1/2
                right-[-100px]
                w-[350px]
                h-[350px]
                -translate-y-1/2
                rounded-full
                border
                border-white/5
            " />


            {/* Contenu supérieur */}

            <div className="
                relative
                z-10
                max-w-2xl
            ">

                {/* LOGO */}
            <div className="
                h-28
                flex
                items-center
                justify-center
                border
                border-slate-700
                bg-blue-900
                p-3
            ">

                <img
                    src="/images/logo-ibm-marega.png"
                    alt="IBM MAREGA"
                    className="w-52 h-28"
                />

            </div>

                {/* Petit titre */}

                <div className="
                    flex
                    items-center
                    gap-8
                    mb-6
                ">

                    <div className="
                        w-8
                        h-px
                        bg-blue-400
                    " />

                    <p className="
                        text-blue-300
                        text-sm
                        font-semibold
                        uppercase
                        tracking-[0.25em]
                    ">
                        Administration immobilière
                    </p>

                </div>


                {/* Gros titre */}
                <div className="h-1 flex items-center justify-center border-w border-slate-700 bg-blue p-3"></div>

                <h2 className="
                    text-5xl
                    gap-8                 
                    lg:text-6xl
                    xl:text-7xl
                    font-bold
                    leading-[1.05]
                    tracking-tight
                ">

                    Gérez votre
                    <br />

                    <span className="text-blue-300">
                        patrimoine
                    </span>

                    <br />

                    immobilier.

                </h2>


                {/* Description */}

                <p className="
                    mt-8
                    text-lg
                    leading-relaxed
                    text-blue-100/70
                    max-w-xl
                ">
                    Une plateforme unique pour piloter vos immeubles,
                    appartements, locataires, contrats et paiements
                    avec simplicité.
                </p>

            </div>


            {/* Cartes du bas */}

            <div className="
                relative
                z-10
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-4
                max-w-2xl
            ">

                <div className="
                    flex
                    items-center
                    gap-4
                    p-5
                    rounded-2xl
                    bg-white/5
                    border
                    border-white/10
                    backdrop-blur-md
                ">

                    <div className="
                        flex-shrink-0
                        w-11
                        h-11
                        rounded-xl
                        bg-blue-500/20
                        flex
                        items-center
                        justify-center
                        text-blue-300
                        text-lg
                    ">
                        ✓
                    </div>

                    <div>

                        <p className="
                            font-semibold
                            text-sm
                            
                        ">
                            Gestion centralisée
                        </p>

                        <p className="
                            text-xs
                            text-blue-100/50
                            mt-1
                        ">
                            Tout votre patrimoine au même endroit
                        </p>

                    </div>

                </div>


                <div className="
                    flex
                    items-center
                    gap-4
                    p-5
                    rounded-2xl
                    bg-white/5
                    border
                    border-white/10
                    backdrop-blur-md
                ">

                    <div className="
                        flex-shrink-0
                        w-11
                        h-11
                        rounded-xl
                        bg-blue-500/20
                        flex
                        items-center
                        justify-center
                        text-blue-300
                        text-lg
                    ">
                        ✓
                    </div>

                    <div>

                        <p className="
                            font-semibold
                            text-sm
                        ">
                            Suivi simplifié
                        </p>

                        <p className="
                            text-xs
                            text-blue-100/50
                            mt-1
                        ">
                            Une vision claire de votre activité
                        </p>

                    </div>

                </div>

            </div>
            
            {/* FOOTER */}
            <div className="border-t border-slate-700 p-5 text-right text-sm text-slate-400">

                Copyright © 2026 TechTradiSport .
                <br></br>Powered by ArS .

            </div>

        </div>


        {/* =====================================================
            PANNEAU DROIT
        ====================================================== */}

        <div className="
            flex-1
            min-h-screen
            bg-white
            flex
            items-center
            justify-center
            px-6
            py-12
            sm:px-10
            lg:px-16
            xl:px-20
        ">

            <div className="
                w-full
                max-w-lg
            ">


                {/* Logo mobile */}

                <div className="
                    md:hidden
                    flex
                    items-center
                    gap-4
                    mb-12
                ">

                    <div className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-2xl
                        font-black
                        shadow-lg
                    ">
                        M
                    </div>

                    <div>

                        <h1 className="
                            text-2xl
                            font-bold
                            text-slate-900
                        ">
                            MAREGA
                        </h1>

                        <p className="
                            text-sm
                            text-slate-500
                        ">
                            Administration immobilière
                        </p>

                    </div>

                </div>


                {/* En-tête */}

                <div className="mb-10">

                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        px-3
                        py-1.5
                        rounded-full
                        bg-blue-50
                        border
                        border-blue-100
                        text-blue-700
                        text-xs
                        font-semibold
                        mb-6
                    ">

                        <span
                            className="
                            w-2
                            h-2
                            rounded-full
                            bg-blue-600
                        "
                        />                    
                        <span>
                        ESPACE ADMINISTRATION

                        </span>                        

                    </div>
                    <br></br><br></br>

                    {/* =====================================================
                        AGENCE SÉLECTIONNÉE
                    ===================================================== */}

                    {agency && (

                        <div className="
                            mb-6
                            flex
                            items-center
                            justify-between
                            gap-4
                            px-4
                            py-3
                            rounded-2xl
                            bg-slate-50
                            border
                            border-slate-200
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-blue-600
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    font-bold
                                ">
                                    {agency.name
                                        ?.charAt(0)
                                        ?.toUpperCase()
                                    }
                                </div>

                                <div>

                                    <p className="
                                        text-xs
                                        text-slate-400
                                        font-medium
                                    ">
                                        Agence sélectionnée
                                    </p>

                                    <p className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    ">
                                        {agency.name}
                                    </p>

                                </div>

                            </div>

                            


                            <button
                                type="button"
                                onClick={handleChangeAgency}
                                className="
                                    text-xs
                                    font-semibold
                                    text-blue-600
                                    hover:text-blue-700
                                    whitespace-nowrap
                                "
                            >
                                Changer
                            </button>

                        </div>

                    )}


                    <h1 className="
                        text-4xl
                        sm:text-5xl
                        font-bold
                        text-slate-900
                        tracking-tight
                    ">
                        Bienvenue
                    </h1>


                    <p className="
                        mt-4
                        text-base
                        leading-relaxed
                        text-slate-500
                        max-w-md
                    ">
                        Connectez-vous à votre espace de gestion MAREGA.
                    </p>
                    <br></br>

                </div>


                {/* Erreur */}

                {error && (
                    <div className="
                        mb-7
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        bg-red-50
                        border
                        border-red-200
                        px-5
                        py-4
                        text-red-700
                        text-sm
                    ">

                        <span className="
                            w-6
                            h-6
                            flex-shrink-0
                            rounded-full
                            bg-red-100
                            flex
                            items-center
                            justify-center
                            font-bold
                        ">
                            !
                        </span>

                        <span className="pt-0.5">
                            {error}
                        </span>

                    </div>
                )}


                {/* Formulaire */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-7"
                >

                    {/* Email */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-3
                        ">
                            Adresse email
                        </label>


                        <div className="relative">

                            <div className="
                                absolute
                                inset-y-0
                                left-5
                                flex
                                items-center
                                pl-5
                                pointer-events-none
                                text-slate-400
                            ">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.7"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m3 7 7.2 4.8a3.25 3.25 0 003.6 0L21 7"
                                    />
                                </svg>

                            </div>
                            


                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@marega.sn"
                                autoComplete="email"
                                required
                                style={{ paddingLeft: "80px" }}
                                className="
                                    w-full
                                    h-16
                                    pr-5
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    text-slate-900
                                    placeholder:text-slate-400
                                    outline-none
                                    transition
                                    duration-200
                                    focus:bg-white
                                    focus:border-blue-500
                                    focus:ring-4
                                    focus:ring-blue-500/10
                                "
                            />

                        </div>

                    </div>
                    <br></br>


                    {/* Mot de passe */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-3
                        ">
                            Mot de passe
                        </label>


                        <div className="relative">

                            <div className="
                                absolute
                                inset-y-0
                                left-5
                                flex
                                items-center
                                pl-5
                                pointer-events-none
                                text-slate-400
                            ">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.7"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75"
                                    />

                                    <rect
                                        width="13.5"
                                        height="10.5"
                                        x="5.25"
                                        y="10.5"
                                        rx="2.25"
                                    />
                                </svg>

                            </div>
                            


                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Votre mot de passe"
                                autoComplete="current-password"
                                required
                                style={{ paddingLeft: "80px" }}
                                className="
                                    w-full
                                    h-16
                                    pr-5
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    text-slate-900
                                    placeholder:text-slate-400
                                    outline-none
                                    transition
                                    duration-200
                                    focus:bg-white
                                    focus:border-blue-500
                                    focus:ring-4
                                    focus:ring-blue-500/10
                                "
                            />

                        </div>

                    </div>
                    <br></br>


                    {/* Bouton */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            h-16
                            rounded-2xl
                            bg-blue-600
                            hover:bg-blue-700
                            active:bg-blue-800
                            disabled:bg-blue-300
                            text-white
                            font-semibold
                            shadow-xl
                            shadow-blue-600/20
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            flex
                            items-center
                            justify-center
                            gap-3
                        "
                    >

                        {loading ? (
                            <>
                                <span
                                    className="
                                        w-5
                                        h-5
                                        border-2
                                        border-white/40
                                        border-t-white
                                        rounded-full
                                        animate-spin
                                    "
                                />

                                <span>
                                    Connexion...
                                </span>
                            </>
                        ) : (
                            <>
                                <span>
                                    Se connecter
                                </span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                    />
                                </svg>
                            </>
                        )}

                    </button>

                </form>


                {/* Footer */}

                <div className="
                    mt-12
                    pt-7
                    border-t
                    border-slate-100
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <p className="
                            text-xs
                            text-slate-400
                        ">
                            MAREGA
                            <span className="mx-2">
                                •
                            </span>
                            Gestion immobilière
                        </p>


                        <p className="
                            text-xs
                            text-slate-300
                        ">
                            Accès sécurisé
                        </p>

                    </div>

                </div>

            </div>

        </div>

    </div>
);
}