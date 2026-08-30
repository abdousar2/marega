import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import "./../styles/platform-agency-details.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export default function PlatformAgencyDetails() {

    const { id } = useParams();

    const [agency, setAgency] = useState(null);

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showAddUserModal, setShowAddUserModal] = useState(false);

    const [userForm, setUserForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "AGENT"
    });

    const [creatingUser, setCreatingUser] = useState(false);

    const [userError, setUserError] = useState("");

    const [showEditUserModal, setShowEditUserModal] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    const [editUserForm, setEditUserForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: "AGENT"
    });

    const [updatingUser, setUpdatingUser] = useState(false);

    const [statusUpdatingUser, setStatusUpdatingUser] = useState(null);

    const [userActionError, setUserActionError] = useState("");

    const [updatingAgencyStatus, setUpdatingAgencyStatus] =
        useState(false);

    const [agencyStatusError, setAgencyStatusError] =
        useState("");

    const [showEditAgencyModal, setShowEditAgencyModal] =
    useState(false);

    const [editingAgency, setEditingAgency] =
        useState(false);

    const [agencyError, setAgencyError] =
        useState("");

    const [agencyForm, setAgencyForm] = useState({
        name: "",
        type: "",
        city: "",
        country: "",
        address: "",
        phone: "",
        email: "",
        status: "active"
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [passwordUser, setPasswordUser] = useState(null);

    const [newPassword, setNewPassword] = useState("");

    const [resettingPassword, setResettingPassword] = useState(false);

    const [passwordError, setPasswordError] = useState("");


    useEffect(() => {

        async function loadAgency() {

            try {

                setLoading(true);
                setError("");


                const response =
                    await fetch(
                        `${API_URL}/platform/agencies/${id}`
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Impossible de charger l'agence."
                    );

                }


                setAgency(data.agency);

                setUsers(
                    data.users || []
                );

            }

            catch (err) {

                console.error(err);

                setError(
                    err.message ||
                    "Impossible de charger l'agence."
                );

            }

            finally {

                setLoading(false);

            }

        }


        loadAgency();

    }, [id]);

    function openEditAgency() {

        setAgencyError("");

        setAgencyForm({

            name:
                agency.name || "",

            type:
                agency.type || "",

            city:
                agency.city || "",

            country:
                agency.country || "",

            address:
                agency.address || "",

            phone:
                agency.phone || "",

            email:
                agency.email || "",

            status:
                agency.status || "active"

        });

        setShowEditAgencyModal(true);

    }

    async function handleUpdateAgency(e) {

        e.preventDefault();

        setAgencyError("");

        setEditingAgency(true);


        try {

            const response =
                await fetch(
                    `${API_URL}/platform/agencies/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(
                            agencyForm
                        )

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de modifier l'agence."
                );

            }


            // Mettre immédiatement à jour l'agence
            setAgency(data.agency);


            // Fermer la modale
            setShowEditAgencyModal(false);


        }

        catch (err) {

            console.error(
                "PLATFORM AGENCY UPDATE ERROR:",
                err
            );


            setAgencyError(
                err.message ||
                "Impossible de modifier l'agence."
            );

        }

        finally {

            setEditingAgency(false);

        }

    }

    async function handleCreateUser(e) {

        e.preventDefault();

        setUserError("");
        setCreatingUser(true);

        try {

            const response = await fetch(
                `${API_URL}/platform/agencies/${id}/users`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(userForm)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de créer l'utilisateur."
                );

            }


            // Ajouter immédiatement le nouvel utilisateur
            setUsers(prevUsers => [
                ...prevUsers,
                data.user
            ]);


            // Fermer la fenêtre
            setShowAddUserModal(false);


            // Réinitialiser le formulaire
            setUserForm({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                role: "AGENT"
            });

        }

        catch (err) {

            console.error(err);

            setUserError(
                err.message ||
                "Impossible de créer l'utilisateur."
            );

        }

        finally {

            setCreatingUser(false);

        }

    }

    function openEditUser(user) {

        setUserActionError("");

        setEditingUser(user);

        setEditUserForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            role: user.role || "AGENT"
        });

        setShowEditUserModal(true);
    }

    async function handleUpdateUser(e) {

        e.preventDefault();

        if (!editingUser) {
            return;
        }

        setUserActionError("");
        setUpdatingUser(true);

        try {

            const response = await fetch(
                `${API_URL}/platform/agencies/${id}/users/${editingUser.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(editUserForm)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de modifier l'utilisateur."
                );

            }


            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === editingUser.id
                        ? data.user
                        : user
                )
            );


            setShowEditUserModal(false);

            setEditingUser(null);

        }

        catch (err) {

            console.error(err);

            setUserActionError(
                err.message ||
                "Impossible de modifier l'utilisateur."
            );

        }

        finally {

            setUpdatingUser(false);

        }

    }

    async function handleToggleUserStatus(user) {

        setUserActionError("");

        setStatusUpdatingUser(user.id);

        try {

            const response = await fetch(
                `${API_URL}/platform/agencies/${id}/users/${user.id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        active: !user.active
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de modifier le statut."
                );

            }


            setUsers(prevUsers =>
                prevUsers.map(currentUser =>
                    currentUser.id === user.id
                        ? data.user
                        : currentUser
                )
            );

        }

        catch (err) {

            console.error(err);

            setUserActionError(
                err.message ||
                "Impossible de modifier le statut."
            );

        }

        finally {

            setStatusUpdatingUser(null);

        }

    }

    async function handleResetPassword(e) {

        e.preventDefault();

        if (!passwordUser) {
            return;
        }


        setPasswordError("");
        setResettingPassword(true);


        try {

            const response =
                await fetch(
                    `${API_URL}/platform/agencies/${id}/users/${passwordUser.id}/password`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            password: newPassword
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de réinitialiser le mot de passe."
                );

            }


            // Fermer la modale

            setShowPasswordModal(false);

            setPasswordUser(null);

            setNewPassword("");

            setPasswordError("");


        }

        catch (err) {

            console.error(err);


            setPasswordError(
                err.message ||
                "Impossible de réinitialiser le mot de passe."
            );

        }

        finally {

            setResettingPassword(false);

        }

    }

    async function handleToggleAgencyStatus() {

        if (!agency) {
            return;
        }


        const nextActive =
            agency.status !== "active";


        const confirmed =
            window.confirm(
                nextActive
                    ? `Voulez-vous réactiver l'agence "${agency.name}" ?`
                    : `Voulez-vous désactiver l'agence "${agency.name}" ?`
            );


        if (!confirmed) {
            return;
        }


        setAgencyStatusError("");

        setUpdatingAgencyStatus(true);


        try {

            const response =
                await fetch(
                    `${API_URL}/platform/agencies/${id}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            active: nextActive
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Impossible de modifier le statut de l'agence."
                );

            }


            // =============================================
            // Mettre à jour l'agence
            // =============================================

            setAgency(data.agency);


            // =============================================
            // Synchroniser les utilisateurs affichés
            // =============================================

            setUsers(prevUsers =>
                prevUsers.map(user => ({
                    ...user,
                    active: nextActive
                }))
            );


        }

        catch (err) {

            console.error(
                "AGENCY STATUS ERROR:",
                err
            );


            setAgencyStatusError(
                err.message ||
                "Impossible de modifier le statut de l'agence."
            );

        }

        finally {

            setUpdatingAgencyStatus(false);

        }

    }


    if (loading) {

        return (

            <div className="platform-agency-details-page">

                <div className="platform-agency-loading">

                    <div className="platform-spinner" />

                    <p>
                        Chargement de l'agence...
                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="platform-agency-details-page">

                <div className="platform-agency-error">

                    <div className="platform-agency-error-icon">
                        !
                    </div>

                    <h2>
                        Impossible de charger l'agence
                    </h2>

                    <p>
                        {error}
                    </p>

                    <NavLink
                        to="/platform/agencies"
                        className="platform-back-button"
                    >
                        ← Retour aux agences
                    </NavLink>

                </div>

            </div>

        );

    }


    if (!agency) {
        return null;
    }


    const initials =
        agency.name
            ?.charAt(0)
            ?.toUpperCase() || "A";


    const admin =
        users.find(
            user => user.role === "ADMIN"
        );


    return (

        <div className="platform-agency-details-page">


            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <div className="platform-agency-details-header">

                <div>

                    <NavLink
                        to="/platform/agencies"
                        className="platform-back-link"
                    >
                        ← Retour aux agences
                    </NavLink>


                    <div className="platform-agency-title-row">

                        <div className="platform-agency-big-avatar">
                            {initials}
                        </div>


                        <div>

                            <div className="platform-agency-status">

                                <span />

                                {agency.status === "active"
                                    ? "Active"
                                    : "Inactive"
                                }

                            </div>


                            <h1>
                                {agency.name}
                            </h1>


                            <p>
                                {agency.type}
                            </p>

                        </div>

                    </div>

                </div>

                <button
                    type="button"
                    className={
                        agency.status === "active"
                            ? "platform-agency-disable-button"
                            : "platform-agency-enable-button"
                    }
                    disabled={updatingAgencyStatus}
                    onClick={handleToggleAgencyStatus}
                >
                    {updatingAgencyStatus
                        ? "Modification..."
                        : agency.status === "active"
                            ? "Désactiver l'agence"
                            : "Activer l'agence"
                    }
                </button>

            </div>

                        {agencyStatusError && (

                <div className="platform-agency-status-error">

                    <span>!</span>

                    <p>
                        {agencyStatusError}
                    </p>

                </div>

            )}


            {/* =================================================
                INFORMATIONS
            ================================================= */}

            <div className="platform-agency-grid">


                <section className="platform-agency-card">

                    <div className="platform-agency-card-header">

                        <div className="platform-card-icon">
                            🏢
                        </div>

                        <div>

                            <h2>
                                Informations de l'agence
                            </h2>

                            <p>
                                Informations générales
                            </p>

                        </div>

                    </div>


                    <div className="platform-info-grid">

                        <div className="platform-info-item">

                            <span>
                                Nom
                            </span>

                            <strong>
                                {agency.name || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Type
                            </span>

                            <strong>
                                {agency.type || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Ville
                            </span>

                            <strong>
                                {agency.city || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Pays
                            </span>

                            <strong>
                                {agency.country || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Adresse
                            </span>

                            <strong>
                                {agency.address || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Téléphone
                            </span>

                            <strong>
                                {agency.phone || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                {agency.email || "—"}
                            </strong>

                        </div>


                        <div className="platform-info-item">

                            <span>
                                Statut
                            </span>

                            <strong className="platform-active-text">

                                <span />

                                {agency.status === "active"
                                    ? "Active"
                                    : "Inactive"
                                }

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ADMINISTRATEUR PRINCIPAL
                ================================================= */}

                <section className="platform-agency-card">

                    <div className="platform-agency-card-header">

                        <div className="platform-card-icon">
                            👤
                        </div>

                        <div>

                            <h2>
                                Administrateur principal
                            </h2>

                            <p>
                                Responsable de l'agence
                            </p>

                        </div>

                    </div>


                    {admin ? (

                        <div className="platform-admin-box">

                            <div className="platform-admin-avatar">

                                {admin.first_name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                            </div>


                            <div className="platform-admin-info">

                                <strong>
                                    {admin.first_name}{" "}
                                    {admin.last_name}
                                </strong>

                                <span>
                                    {admin.email}
                                </span>

                                <small>
                                    ADMIN
                                </small>

                            </div>

                        </div>

                    ) : (

                        <div className="platform-empty-state">

                            Aucun administrateur
                            principal trouvé.

                        </div>

                    )}

                </section>

            </div>


            {/* =================================================
                UTILISATEURS
            ================================================= */}

            <section className="platform-agency-card platform-users-card">

                <div className="platform-users-header">

                    <div className="platform-agency-card-header">

                        <div className="platform-card-icon">
                            👥
                        </div>

                        <div>

                            <h2>
                                Utilisateurs de l'agence
                            </h2>

                            <p>
                                {users.length} utilisateur
                                {users.length > 1 ? "s" : ""}
                                rattaché
                                {users.length > 1 ? "s" : ""}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="platform-add-user-button"
                        onClick={() => {
                            setUserError("");
                            setShowAddUserModal(true);
                        }}
                    >
                        + Ajouter un utilisateur
                    </button>

                </div>

                {users.length === 0 ? (

                    <div className="platform-users-empty">

                        <div>
                            👥
                        </div>

                        <h3>
                            Aucun utilisateur
                        </h3>

                        <p>
                            Cette agence ne possède
                            encore aucun utilisateur.
                        </p>

                    </div>

                ) : (

                    <div className="platform-users-table-wrapper">

                        <table className="platform-users-table">

                            <thead>

                                <tr>

                                    <th>
                                        Utilisateur
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Rôle
                                    </th>

                                    <th>
                                        Statut
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {users.map(user => (

                                    <tr key={user.id}>

                                        <td>

                                            <div className="platform-user-cell">

                                                <div className="platform-user-avatar">

                                                    {user.first_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                    }

                                                </div>


                                                <strong>

                                                    {user.first_name}{" "}
                                                    {user.last_name}

                                                </strong>

                                            </div>

                                        </td>


                                        <td>
                                            {user.email}
                                        </td>


                                        <td>

                                            <span className="platform-role-badge">

                                                {user.role}

                                            </span>

                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    user.active
                                                        ? "platform-user-status active"
                                                        : "platform-user-status inactive"
                                                }
                                            >

                                                <span />

                                                {user.active
                                                    ? "Actif"
                                                    : "Inactif"
                                                }

                                            </span>

                                        </td>

                                        <td>

                                            <div className="platform-user-actions">

                                                <button
                                                    type="button"
                                                    className="platform-user-edit-button"
                                                    onClick={() => openEditUser(user)}
                                                >
                                                    Modifier
                                                </button>


                                                <button
                                                    type="button"
                                                    className="platform-user-password-button"
                                                    onClick={() => {

                                                        setPasswordUser(user);

                                                        setNewPassword("");

                                                        setPasswordError("");

                                                        setShowPasswordModal(true);

                                                    }}
                                                >
                                                    Mot de passe
                                                </button>


                                                <button
                                                    type="button"
                                                    className={
                                                        user.active
                                                            ? "platform-user-disable-button"
                                                            : "platform-user-enable-button"
                                                    }
                                                    disabled={
                                                        statusUpdatingUser === user.id
                                                    }
                                                    onClick={() =>
                                                        handleToggleUserStatus(user)
                                                    }
                                                >

                                                    {statusUpdatingUser === user.id
                                                        ? "..."
                                                        : user.active
                                                            ? "Désactiver"
                                                            : "Activer"
                                                    }

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

            {/* =================================================
                MODALE AJOUT UTILISATEUR
            ================================================= */}

            {showAddUserModal && (

                <div className="platform-modal-overlay">

                    <div className="platform-modal">

                        <div className="platform-modal-header">

                            <div>

                                <p className="platform-modal-eyebrow">
                                    Gestion des utilisateurs
                                </p>

                                <h2>
                                    Ajouter un utilisateur
                                </h2>

                                <p>
                                    Créer un nouvel utilisateur pour{" "}
                                    <strong>
                                        {agency.name}
                                    </strong>
                                </p>

                            </div>


                            <button
                                type="button"
                                className="platform-modal-close"
                                onClick={() => {
                                    if (!creatingUser) {
                                        setShowAddUserModal(false);
                                        setUserError("");
                                    }
                                }}
                            >
                                ×
                            </button>

                        </div>


                        {userError && (

                            <div className="platform-modal-error">

                                <span>!</span>

                                <p>
                                    {userError}
                                </p>

                            </div>

                        )}


                        <form
                            onSubmit={handleCreateUser}
                            className="platform-user-form"
                        >

                            <div className="platform-form-row">

                                <div className="platform-form-group">

                                    <label>
                                        Prénom
                                    </label>

                                    <input
                                        type="text"
                                        value={userForm.first_name}
                                        onChange={(e) =>
                                            setUserForm({
                                                ...userForm,
                                                first_name: e.target.value
                                            })
                                        }
                                        placeholder="Ex. Mamadou"
                                        required
                                    />

                                </div>


                                <div className="platform-form-group">

                                    <label>
                                        Nom
                                    </label>

                                    <input
                                        type="text"
                                        value={userForm.last_name}
                                        onChange={(e) =>
                                            setUserForm({
                                                ...userForm,
                                                last_name: e.target.value
                                            })
                                        }
                                        placeholder="Ex. Diallo"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Adresse email
                                </label>

                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) =>
                                        setUserForm({
                                            ...userForm,
                                            email: e.target.value
                                        })
                                    }
                                    placeholder="utilisateur@agence.sn"
                                    required
                                />

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Rôle
                                </label>

                                <select
                                    value={userForm.role}
                                    onChange={(e) =>
                                        setUserForm({
                                            ...userForm,
                                            role: e.target.value
                                        })
                                    }
                                    required
                                >

                                    <option value="ADMIN">
                                        Administrateur
                                    </option>

                                    <option value="RESPONSABLE">
                                        Responsable
                                    </option>

                                    <option value="COMPTABLE">
                                        Comptable
                                    </option>

                                    <option value="AGENT">
                                        Agent
                                    </option>

                                </select>

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Mot de passe
                                </label>

                                <input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) =>
                                        setUserForm({
                                            ...userForm,
                                            password: e.target.value
                                        })
                                    }
                                    placeholder="Minimum 8 caractères"
                                    minLength={8}
                                    required
                                />

                                <small>
                                    Le mot de passe doit contenir au moins
                                    8 caractères.
                                </small>

                            </div>


                            <div className="platform-modal-actions">

                                <button
                                    type="button"
                                    className="platform-modal-cancel"
                                    disabled={creatingUser}
                                    onClick={() => {
                                        setShowAddUserModal(false);
                                        setUserError("");
                                    }}
                                >
                                    Annuler
                                </button>


                                <button
                                    type="submit"
                                    className="platform-modal-submit"
                                    disabled={creatingUser}
                                >

                                    {creatingUser ? (
                                        <>
                                            <span className="platform-button-spinner" />
                                            Création...
                                        </>
                                    ) : (
                                        "Créer l'utilisateur"
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {showEditUserModal && editingUser && (

                <div className="platform-modal-overlay">

                    <div className="platform-modal">

                        <div className="platform-modal-header">

                            <div>

                                <p className="platform-modal-eyebrow">
                                    Gestion des utilisateurs
                                </p>

                                <h2>
                                    Modifier l'utilisateur
                                </h2>

                                <p>
                                    Modifier les informations de{" "}
                                    <strong>
                                        {editingUser.first_name}{" "}
                                        {editingUser.last_name}
                                    </strong>
                                </p>

                            </div>


                            <button
                                type="button"
                                className="platform-modal-close"
                                disabled={updatingUser}
                                onClick={() => {

                                    setShowEditUserModal(false);

                                    setEditingUser(null);

                                    setUserActionError("");

                                }}
                            >
                                ×
                            </button>

                        </div>


                        {userActionError && (

                            <div className="platform-modal-error">

                                <span>
                                    !
                                </span>

                                <p>
                                    {userActionError}
                                </p>

                            </div>

                        )}


                        <form
                            onSubmit={handleUpdateUser}
                            className="platform-user-form"
                        >

                            <div className="platform-form-row">

                                <div className="platform-form-group">

                                    <label>
                                        Prénom
                                    </label>

                                    <input
                                        type="text"
                                        value={editUserForm.first_name}
                                        onChange={(e) =>
                                            setEditUserForm({
                                                ...editUserForm,
                                                first_name: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>


                                <div className="platform-form-group">

                                    <label>
                                        Nom
                                    </label>

                                    <input
                                        type="text"
                                        value={editUserForm.last_name}
                                        onChange={(e) =>
                                            setEditUserForm({
                                                ...editUserForm,
                                                last_name: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Adresse email
                                </label>

                                <input
                                    type="email"
                                    value={editUserForm.email}
                                    onChange={(e) =>
                                        setEditUserForm({
                                            ...editUserForm,
                                            email: e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Rôle
                                </label>

                                <select
                                    value={editUserForm.role}
                                    onChange={(e) =>
                                        setEditUserForm({
                                            ...editUserForm,
                                            role: e.target.value
                                        })
                                    }
                                    required
                                >

                                    <option value="ADMIN">
                                        Administrateur
                                    </option>

                                    <option value="RESPONSABLE">
                                        Responsable
                                    </option>

                                    <option value="COMPTABLE">
                                        Comptable
                                    </option>

                                    <option value="AGENT">
                                        Agent
                                    </option>

                                </select>

                            </div>


                            <div className="platform-modal-actions">

                                <button
                                    type="button"
                                    className="platform-modal-cancel"
                                    disabled={updatingUser}
                                    onClick={() => {

                                        setShowEditUserModal(false);

                                        setEditingUser(null);

                                        setUserActionError("");

                                    }}
                                >
                                    Annuler
                                </button>


                                <button
                                    type="submit"
                                    className="platform-modal-submit"
                                    disabled={updatingUser}
                                >

                                    {updatingUser ? (
                                        <>
                                            <span className="platform-button-spinner" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        "Enregistrer les modifications"
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =================================================
                MODALE RÉINITIALISATION MOT DE PASSE
            ================================================= */}

            {showPasswordModal && passwordUser && (

                <div className="platform-modal-overlay">

                    <div className="platform-modal">

                        <div className="platform-modal-header">

                            <div>

                                <p className="platform-modal-eyebrow">
                                    Sécurité du compte
                                </p>

                                <h2>
                                    Réinitialiser le mot de passe
                                </h2>

                                <p>

                                    Définir un nouveau mot de passe pour{" "}

                                    <strong>
                                        {passwordUser.first_name}{" "}
                                        {passwordUser.last_name}
                                    </strong>

                                </p>

                            </div>


                            <button
                                type="button"
                                className="platform-modal-close"
                                disabled={resettingPassword}
                                onClick={() => {

                                    setShowPasswordModal(false);

                                    setPasswordUser(null);

                                    setNewPassword("");

                                    setPasswordError("");

                                }}
                            >
                                ×
                            </button>

                        </div>


                        {passwordError && (

                            <div className="platform-modal-error">

                                <span>
                                    !
                                </span>

                                <p>
                                    {passwordError}
                                </p>

                            </div>

                        )}


                        <form
                            onSubmit={handleResetPassword}
                            className="platform-user-form"
                        >

                            <div className="platform-form-group">

                                <label>
                                    Utilisateur
                                </label>

                                <input
                                    type="text"
                                    value={`${passwordUser.first_name} ${passwordUser.last_name}`}
                                    disabled
                                />

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Nouveau mot de passe
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Minimum 8 caractères"
                                    minLength={8}
                                    required
                                    autoFocus
                                />

                                <small>
                                    Le nouveau mot de passe doit contenir
                                    au moins 8 caractères.
                                </small>

                            </div>


                            <div className="platform-modal-actions">

                                <button
                                    type="button"
                                    className="platform-modal-cancel"
                                    disabled={resettingPassword}
                                    onClick={() => {

                                        setShowPasswordModal(false);

                                        setPasswordUser(null);

                                        setNewPassword("");

                                        setPasswordError("");

                                    }}
                                >
                                    Annuler
                                </button>


                                <button
                                    type="submit"
                                    className="platform-modal-submit"
                                    disabled={
                                        resettingPassword ||
                                        newPassword.length < 8
                                    }
                                >

                                    {resettingPassword ? (

                                        <>
                                            <span className="platform-button-spinner" />

                                            Réinitialisation...

                                        </>

                                    ) : (

                                        "Réinitialiser le mot de passe"

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =================================================
                MODALE MODIFICATION AGENCE
            ================================================= */}

            {showEditAgencyModal && (

                <div className="platform-modal-overlay">

                    <div className="platform-modal platform-agency-edit-modal">

                        <div className="platform-modal-header">

                            <div>

                                <p className="platform-modal-eyebrow">
                                    Gestion de l'agence
                                </p>

                                <h2>
                                    Modifier l'agence
                                </h2>

                                <p>
                                    Modifier les informations de{" "}
                                    <strong>
                                        {agency.name}
                                    </strong>
                                </p>

                            </div>


                            <button
                                type="button"
                                className="platform-modal-close"
                                disabled={editingAgency}
                                onClick={() => {

                                    setShowEditAgencyModal(false);

                                    setAgencyError("");

                                }}
                            >
                                ×
                            </button>

                        </div>


                        {agencyError && (

                            <div className="platform-modal-error">

                                <span>
                                    !
                                </span>

                                <p>
                                    {agencyError}
                                </p>

                            </div>

                        )}


                        <form
                            onSubmit={handleUpdateAgency}
                            className="platform-user-form"
                        >

                            {/* =================================================
                                INFORMATIONS GÉNÉRALES
                            ================================================= */}

                            <div className="platform-modal-section-title">
                                Informations générales
                            </div>


                            <div className="platform-form-row">

                                <div className="platform-form-group">

                                    <label>
                                        Nom de l'agence *
                                    </label>

                                    <input
                                        type="text"
                                        value={agencyForm.name}
                                        onChange={(e) =>
                                            setAgencyForm({
                                                ...agencyForm,
                                                name: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>


                                <div className="platform-form-group">

                                    <label>
                                        Type *
                                    </label>

                                    <input
                                        type="text"
                                        value={agencyForm.type}
                                        onChange={(e) =>
                                            setAgencyForm({
                                                ...agencyForm,
                                                type: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                LOCALISATION
                            ================================================= */}

                            <div className="platform-form-row">

                                <div className="platform-form-group">

                                    <label>
                                        Ville *
                                    </label>

                                    <input
                                        type="text"
                                        value={agencyForm.city}
                                        onChange={(e) =>
                                            setAgencyForm({
                                                ...agencyForm,
                                                city: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>


                                <div className="platform-form-group">

                                    <label>
                                        Pays *
                                    </label>

                                    <input
                                        type="text"
                                        value={agencyForm.country}
                                        onChange={(e) =>
                                            setAgencyForm({
                                                ...agencyForm,
                                                country: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            <div className="platform-form-group">

                                <label>
                                    Adresse
                                </label>

                                <input
                                    type="text"
                                    value={agencyForm.address}
                                    onChange={(e) =>
                                        setAgencyForm({
                                            ...agencyForm,
                                            address: e.target.value
                                        })
                                    }
                                    placeholder="Adresse complète"
                                />

                            </div>


                            {/* =================================================
                                CONTACT
                            ================================================= */}

                            <div className="platform-modal-section-title">
                                Coordonnées
                            </div>


                            <div className="platform-form-row">

                                <div className="platform-form-group">

                                    <label>
                                        Téléphone
                                    </label>

                                    <input
                                        type="text"
                                        value={agencyForm.phone}
                                        onChange={(e) =>
                                            setAgencyForm({
                                                ...agencyForm,
                                                phone: e.target.value
                                            })
                                        }
                                    />

                                </div>


                                <div className="platform-form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={agencyForm.email}
                                        onChange={(e) =>
                                            setAgencyForm({
                                                ...agencyForm,
                                                email: e.target.value
                                            })
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                STATUT
                            ================================================= */}

                            <div className="platform-form-group">

                                <label>
                                    Statut
                                </label>

                                <select
                                    value={agencyForm.status}
                                    onChange={(e) =>
                                        setAgencyForm({
                                            ...agencyForm,
                                            status: e.target.value
                                        })
                                    }
                                >

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="platform-modal-actions">

                                <button
                                    type="button"
                                    className="platform-modal-cancel"
                                    disabled={editingAgency}
                                    onClick={() => {

                                        setShowEditAgencyModal(false);

                                        setAgencyError("");

                                    }}
                                >
                                    Annuler
                                </button>


                                <button
                                    type="submit"
                                    className="platform-modal-submit"
                                    disabled={editingAgency}
                                >

                                    {editingAgency ? (

                                        <>
                                            <span className="platform-button-spinner" />

                                            Enregistrement...

                                        </>

                                    ) : (

                                        "Enregistrer les modifications"

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}