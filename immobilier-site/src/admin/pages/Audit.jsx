import { useEffect, useMemo, useState } from "react";

import Layout from "../Layout";

import {
    PageHeader,
    StatsCard,
    SearchBar,
    Card,
    Badge,
    Button,
    Empty,
    Modal
} from "../../components/ui";

import AuditService from "../../services/audit.service";


export default function Audit() {

    const [logs, setLogs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [moduleFilter, setModuleFilter] =
        useState("all");

    const [actionFilter, setActionFilter] =
        useState("all");

    const [selectedLog, setSelectedLog] =
        useState(null);


    // =========================================================
    // CHARGEMENT
    // =========================================================

    async function loadAudit() {

        try {

            setLoading(true);

            const data =
                await AuditService.getAll();

            setLogs(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (err) {

            console.error(
                "Erreur chargement audit :",
                err
            );

        }

        finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadAudit();

    }, []);


    // =========================================================
    // STATISTIQUES
    // =========================================================

    const totalOperations =
        logs.length;


    const createCount =
        logs.filter(
            log => log.action === "CREATE"
        ).length;


    const updateCount =
        logs.filter(
            log => log.action === "UPDATE"
        ).length;


    const deleteCount =
        logs.filter(
            log =>
                log.action === "DELETE"
                ||
                log.action === "DELETE_ATTEMPT"
        ).length;


    const protectedCount =
        logs.filter(
            log =>
                log.action.endsWith("_ATTEMPT")
        ).length;


    // =========================================================
    // MODULES
    // =========================================================

    const modules =
        useMemo(() => {

            return [
                ...new Set(
                    logs
                        .map(log => log.module)
                        .filter(Boolean)
                )
            ];

        }, [logs]);


    const actions =
        useMemo(() => {

            return [
                ...new Set(
                    logs
                        .map(log => log.action)
                        .filter(Boolean)
                )
            ];

        }, [logs]);


    // =========================================================
    // FILTRAGE
    // =========================================================

    const filteredLogs =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            return logs.filter(log => {

                if (
                    moduleFilter !== "all"
                    &&
                    log.module !== moduleFilter
                ) {

                    return false;

                }


                if (
                    actionFilter !== "all"
                    &&
                    log.action !== actionFilter
                ) {

                    return false;

                }


                if (!keyword) {

                    return true;

                }


                const details =
                    log.details
                        ? JSON.stringify(
                            log.details
                        )
                        : "";


                const user =
                    [
                        log.first_name,
                        log.last_name,
                        log.email,
                        log.role
                    ]
                        .filter(Boolean)
                        .join(" ");


                const content =
                    [
                        log.action,
                        log.module,
                        log.entity_id,
                        user,
                        details
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                return content.includes(
                    keyword
                );

            });

        }, [
            logs,
            search,
            moduleFilter,
            actionFilter
        ]);


    // =========================================================
    // OUTILS AFFICHAGE
    // =========================================================

    function getUserName(log) {

        const name =
            [
                log.first_name,
                log.last_name
            ]
                .filter(Boolean)
                .join(" ");


        return (
            name
            ||
            log.email
            ||
            "Utilisateur inconnu"
        );

    }


    function formatDate(date) {

        if (!date) {

            return "Date inconnue";

        }


        return new Date(date)
            .toLocaleString(
                "fr-FR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }


    function formatModule(module) {

        const labels = {

            payments: "Paiements",

            expenses: "Dépenses",

            rents: "Loyers",

            leases: "Contrats",

            tenants: "Locataires",

            apartments: "Appartements",

            buildings: "Immeubles",

            users: "Utilisateurs",

            auth: "Authentification"

        };


        return (
            labels[module]
            ||
            module
            ||
            "Inconnu"
        );

    }


    function getActionLabel(action) {

        const labels = {

            CREATE: "Création",

            UPDATE: "Modification",

            DELETE: "Suppression",

            DELETE_ATTEMPT:
                "Tentative de suppression",

            UPDATE_ATTEMPT:
                "Tentative de modification",

            CREATE_ATTEMPT:
                "Tentative de création",

            LOGIN: "Connexion",

            LOGOUT: "Déconnexion"

        };


        return (
            labels[action]
            ||
            action
            ||
            "Action inconnue"
        );

    }


    function getActionColor(action) {

        if (
            action?.endsWith("_ATTEMPT")
        ) {

            return "orange";

        }


        switch (action) {

            case "CREATE":
                return "green";

            case "UPDATE":
                return "blue";

            case "DELETE":
                return "red";

            case "LOGIN":
                return "green";

            case "LOGOUT":
                return "slate";

            default:
                return "blue";

        }

    }


    function getActionIcon(action) {

        if (
            action?.endsWith("_ATTEMPT")
        ) {

            return "⚠️";

        }


        switch (action) {

            case "CREATE":
                return "➕";

            case "UPDATE":
                return "✏️";

            case "DELETE":
                return "🗑️";

            case "LOGIN":
                return "🔐";

            case "LOGOUT":
                return "🚪";

            default:
                return "📋";

        }

    }


    function formatValue(value) {

        if (
            value === null
            ||
            value === undefined
            ||
            value === ""
        ) {

            return "—";

        }


        if (
            typeof value === "number"
        ) {

            return value.toLocaleString(
                "fr-FR"
            );

        }


        return String(value);

    }


    // =========================================================
    // AVANT / APRÈS
    // =========================================================

    function renderChanges(details) {

        if (
            !details
            ||
            !details.before
            ||
            !details.after
        ) {

            return null;

        }


        const fields =
            [
                ...new Set([
                    ...Object.keys(
                        details.before
                    ),
                    ...Object.keys(
                        details.after
                    )
                ])
            ];


        return (

            <div className="mt-6">

                <h3 className="
                    text-lg
                    font-bold
                    text-slate-800
                    mb-4
                ">
                    Modifications
                </h3>


                <div className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                ">

                    <div className="
                        grid
                        grid-cols-3
                        bg-slate-50
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-slate-600
                    ">

                        <div>
                            Champ
                        </div>

                        <div>
                            Avant
                        </div>

                        <div>
                            Après
                        </div>

                    </div>


                    {fields.map(field => {

                        const before =
                            details.before[field];

                        const after =
                            details.after[field];


                        const changed =
                            String(before ?? "")
                            !==
                            String(after ?? "");


                        return (

                            <div
                                key={field}
                                className={`
                                    grid
                                    grid-cols-3
                                    px-4
                                    py-3
                                    border-t
                                    border-slate-100
                                    text-sm
                                    ${
                                        changed
                                            ? "bg-blue-50/50"
                                            : ""
                                    }
                                `}
                            >

                                <div className="
                                    font-medium
                                    text-slate-700
                                ">
                                    {field}
                                </div>

                                <div className="
                                    text-slate-500
                                    break-words
                                ">
                                    {formatValue(before)}
                                </div>

                                <div className="
                                    text-slate-700
                                    font-medium
                                    break-words
                                ">
                                    {formatValue(after)}
                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        );

    }


    // =========================================================
    // DÉTAILS
    // =========================================================

    function renderDetails(details) {

        if (!details) {

            return (

                <p className="
                    text-slate-500
                ">
                    Aucun détail disponible.
                </p>

            );

        }


        if (
            details.before
            &&
            details.after
        ) {

            return renderChanges(
                details
            );

        }


        const entries =
            Object.entries(
                details
            );


        return (

            <div className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
            ">

                {entries.map(
                    ([key, value]) => (

                        <div
                            key={key}
                            className="
                                rounded-2xl
                                bg-slate-50
                                border
                                border-slate-100
                                p-4
                            "
                        >

                            <p className="
                                text-xs
                                uppercase
                                tracking-wide
                                text-slate-400
                                font-semibold
                            ">
                                {key}
                            </p>

                            <p className="
                                mt-2
                                font-medium
                                text-slate-700
                                break-words
                            ">
                                {
                                    typeof value === "object"
                                        ? JSON.stringify(
                                            value,
                                            null,
                                            2
                                        )
                                        : formatValue(
                                            value
                                        )
                                }
                            </p>

                        </div>

                    )
                )}

            </div>

        );

    }


    // =========================================================
    // CHARGEMENT
    // =========================================================

    if (loading) {

        return (

            <Layout>

                <div className="
                    py-20
                    text-center
                    text-slate-500
                ">

                    Chargement du journal d'audit...

                </div>

            </Layout>

        );

    }


    // =========================================================
    // RENDU
    // =========================================================

    return (

        <Layout>

            <div className="space-y-8">


                <PageHeader

                    title="Journal d'audit"

                    subtitle="
                        Historique et traçabilité des opérations
                        effectuées dans MAREGA.
                    "

                />
                <br></br>


                {/* ================================================= */}
                {/* STATISTIQUES */}
                {/* ================================================= */}

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-5
                    gap-6
                ">

                    <StatsCard
                        title="Opérations"
                        value={totalOperations}
                        icon="📋"
                        color="blue"
                    />

                    <StatsCard
                        title="Créations"
                        value={createCount}
                        icon="➕"
                        color="green"
                    />

                    <StatsCard
                        title="Modifications"
                        value={updateCount}
                        icon="✏️"
                        color="blue"
                    />

                    <StatsCard
                        title="Suppressions"
                        value={deleteCount}
                        icon="🗑️"
                        color="red"
                    />

                    <StatsCard
                        title="Tentatives bloquées"
                        value={protectedCount}
                        icon="⚠️"
                        color="orange"
                    />

                </div>
                <br></br>


                {/* ================================================= */}
                {/* FILTRES */}
                {/* ================================================= */}

                <Card>

                    <div className="
                        grid
                        grid-cols-1
                        lg:grid-cols-3
                        gap-8
                    ">

                        <div className="lg:col-span-1">

                            <SearchBar
                                value={search}
                                onChange={
                                    e =>
                                        setSearch(
                                            e.target.value
                                        )
                                }
                                placeholder="
                Rechercher dans le journal...
                                "
                            />

                        </div>


                        <select
                            value={moduleFilter}
                            onChange={
                                e =>
                                    setModuleFilter(
                                        e.target.value
                                    )
                            }
                            className="
                                w-full
                                border
                                border-slate-200
                                rounded-xl
                                px-4
                                py-3
                                bg-white
                                outline-none
                                focus:border-blue-500
                                focus:ring-4
                                focus:ring-blue-500/10
                            "
                        >

                            <option value="all">
                                Tous les modules
                            </option>

                            {modules.map(
                                module => (

                                    <option
                                        key={module}
                                        value={module}
                                    >
                                        {formatModule(
                                            module
                                        )}
                                    </option>

                                )
                            )}

                        </select>


                        <select
                            value={actionFilter}
                            onChange={
                                e =>
                                    setActionFilter(
                                        e.target.value
                                    )
                            }
                            className="
                                w-full
                                border
                                border-slate-200
                                rounded-xl
                                px-4
                                py-3
                                bg-white
                                outline-none
                                focus:border-blue-500
                                focus:ring-4
                                focus:ring-blue-500/10
                            "
                        >

                            <option value="all">
                                Toutes les actions
                            </option>

                            {actions.map(
                                action => (

                                    <option
                                        key={action}
                                        value={action}
                                    >
                                        {getActionLabel(
                                            action
                                        )}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                </Card>
                <br></br>


                {/* ================================================= */}
                {/* HISTORIQUE */}
                {/* ================================================= */}

                <Card>

                    <div className="
                        flex
                        items-center
                        justify-between
                        mb-6
                    ">

                        <div>

                            <h2 className="
                                text-2xl
                                font-bold
                                text-slate-800
                            ">
                                Historique des opérations
                            </h2>

                            <p className="
                                text-slate-500
                                text-sm
                                mt-1
                            ">
                                {filteredLogs.length} opération(s)
                                affichée(s)
                            </p>

                        </div>

                    </div>


                    {filteredLogs.length === 0 ? (

                        <Empty

                            title="Aucune opération"

                            subtitle="
                                Aucun événement ne correspond
                                aux critères sélectionnés.
                            "

                        />

                    ) : (

                        <div className="
                            divide-y
                            divide-slate-100
                        ">

                            {filteredLogs.map(
                                log => (

                                    <div
                                        key={log.id}
                                        className="
                                            py-6
                                            px-3
                                            -mx-3
                                            rounded-2xl
                                            hover:bg-slate-50
                                            transition
                                        "
                                    >

                                        <div className="
                                            flex
                                            flex-col
                                            lg:flex-row
                                            lg:items-center
                                            lg:justify-between
                                            gap-5
                                        ">


                                            {/* GAUCHE */}

                                            <div className="
                                                flex
                                                items-start
                                                gap-4
                                            ">

                                                <div
                                                    className={`
                                                        w-12
                                                        h-12
                                                        rounded-full
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-lg
                                                        shrink-0
                                                        ${
                                                            log.action?.endsWith(
                                                                "_ATTEMPT"
                                                            )
                                                                ? "bg-orange-100"
                                                                : log.action === "CREATE"
                                                                ? "bg-green-100"
                                                                : log.action === "DELETE"
                                                                ? "bg-red-100"
                                                                : "bg-blue-100"
                                                        }
                                                    `}
                                                >

                                                    {
                                                        getActionIcon(
                                                            log.action
                                                        )
                                                    }

                                                </div>


                                                <div>

                                                    <div className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-2
                                                    ">

                                                        <Badge
                                                            color={
                                                                getActionColor(
                                                                    log.action
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getActionLabel(
                                                                    log.action
                                                                )
                                                            }
                                                        </Badge>

                                                        <Badge
                                                            color="blue"
                                                        >
                                                            {
                                                                formatModule(
                                                                    log.module
                                                                )
                                                            }
                                                        </Badge>

                                                    </div>


                                                    <p className="
                                                        font-semibold
                                                        text-slate-800
                                                        mt-3
                                                    ">

                                                        {
                                                            getUserName(
                                                                log
                                                            )
                                                        }

                                                    </p>


                                                    <p className="
                                                        text-slate-500
                                                        text-sm
                                                        mt-1
                                                    ">

                                                        Opération sur
                                                        l'entité #

                                                        {
                                                            log.entity_id
                                                            ??
                                                            "—"
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            {/* DROITE */}

                                            <div className="
                                                flex
                                                flex-col
                                                items-start
                                                lg:items-end
                                                gap-3
                                            ">

                                                <span className="
                                                    text-sm
                                                    text-slate-400
                                                ">

                                                    {
                                                        formatDate(
                                                            log.created_at
                                                        )
                                                    }

                                                </span>


                                                <Button

                                                    variant="secondary"

                                                    onClick={() =>
                                                        setSelectedLog(
                                                            log
                                                        )
                                                    }

                                                >

                                                    Voir les détails

                                                </Button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </Card>


            </div>


            {/* ===================================================== */}
            {/* MODAL */}
            {/* ===================================================== */}

            <Modal

                open={
                    Boolean(
                        selectedLog
                    )
                }

                title={
                    selectedLog
                        ? getActionLabel(
                            selectedLog.action
                        )
                        : "Détails"
                }

                onClose={() =>
                    setSelectedLog(null)
                }

            >

                {selectedLog && (

                    <div className="
                        space-y-6
                    ">


                        {/* IDENTITÉ */}

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-4
                        ">

                            <div className="
                                rounded-2xl
                                bg-slate-50
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    uppercase
                                    text-slate-400
                                    font-semibold
                                ">
                                    Utilisateur
                                </p>

                                <p className="
                                    mt-2
                                    font-semibold
                                    text-slate-800
                                ">
                                    {
                                        getUserName(
                                            selectedLog
                                        )
                                    }
                                </p>

                                {selectedLog.role && (

                                    <p className="
                                        text-sm
                                        text-slate-500
                                        mt-1
                                    ">
                                        {selectedLog.role}
                                    </p>

                                )}

                            </div>


                            <div className="
                                rounded-2xl
                                bg-slate-50
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    uppercase
                                    text-slate-400
                                    font-semibold
                                ">
                                    Date
                                </p>

                                <p className="
                                    mt-2
                                    font-semibold
                                    text-slate-800
                                ">
                                    {
                                        formatDate(
                                            selectedLog.created_at
                                        )
                                    }
                                </p>

                            </div>


                            <div className="
                                rounded-2xl
                                bg-slate-50
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    uppercase
                                    text-slate-400
                                    font-semibold
                                ">
                                    Module
                                </p>

                                <p className="
                                    mt-2
                                    font-semibold
                                    text-slate-800
                                ">
                                    {
                                        formatModule(
                                            selectedLog.module
                                        )
                                    }
                                </p>

                            </div>


                            <div className="
                                rounded-2xl
                                bg-slate-50
                                p-4
                            ">

                                <p className="
                                    text-xs
                                    uppercase
                                    text-slate-400
                                    font-semibold
                                ">
                                    Entité
                                </p>

                                <p className="
                                    mt-2
                                    font-semibold
                                    text-slate-800
                                ">
                                    #
                                    {
                                        selectedLog.entity_id
                                        ??
                                        "—"
                                    }
                                </p>

                            </div>

                        </div>


                        {/* ALERTE */}

                        {
                            selectedLog.action?.endsWith(
                                "_ATTEMPT"
                            )
                            &&
                            (

                                <div className="
                                    rounded-2xl
                                    bg-orange-50
                                    border
                                    border-orange-200
                                    p-5
                                ">

                                    <p className="
                                        font-bold
                                        text-orange-700
                                    ">
                                        ⚠️ Opération protégée
                                    </p>

                                    <p className="
                                        text-sm
                                        text-orange-700
                                        mt-2
                                    ">
                                        Cette opération a été détectée
                                        mais n'a pas été autorisée.
                                    </p>

                                </div>

                            )
                        }


                        {/* DÉTAILS */}

                        <div>

                            <h3 className="
                                text-lg
                                font-bold
                                text-slate-800
                            ">
                                Détails
                            </h3>

                            {
                                renderDetails(
                                    selectedLog.details
                                )
                            }

                        </div>


                        {/* TECHNIQUE */}

                        <div className="
                            border-t
                            border-slate-100
                            pt-5
                        ">

                            <h3 className="
                                text-sm
                                font-bold
                                text-slate-700
                                mb-3
                            ">
                                Informations techniques
                            </h3>

                            <div className="
                                text-sm
                                text-slate-500
                                space-y-2
                            ">

                                <p>
                                    Adresse IP :
                                    {" "}
                                    {
                                        selectedLog.ip_address
                                        ||
                                        "—"
                                    }
                                </p>

                                <p className="
                                    break-words
                                ">
                                    Navigateur :
                                    {" "}
                                    {
                                        selectedLog.user_agent
                                        ||
                                        "—"
                                    }
                                </p>

                            </div>

                        </div>


                    </div>

                )}

            </Modal>

        </Layout>

    );

}