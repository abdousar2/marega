
import { useEffect, useState } from "react";

import PlatformSidebar
    from "../components/PlatformSidebar";

import PlatformHeader
    from "../components/PlatformHeader";

import "../styles/platform-agencies.css";

import "../styles/platform-users.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
    }).format(date);
}

export default function PlatformUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    });

    const [editingUser, setEditingUser] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    const [editForm, setEditForm] = useState({
        first_name: "",
        last_name: "",
        email: ""
    });

    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [statusError, setStatusError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");

    const [deletingUserId, setDeletingUserId] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleteSuccess, setDeleteSuccess] = useState("");

    async function handleCreateUser(e) {
        e.preventDefault();

        setCreateError("");
        setCreateSuccess("");
        setCreating(true);

        try {
            const token = localStorage.getItem(
                "techtradisport_platform_token"
            );

            if (!token) {
                throw new Error(
                    "Session administrateur absente. Veuillez vous reconnecter."
                );
            }

            const response = await fetch(
                `${API_URL}/platform/users`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de créer l'administrateur."
                );
            }

            setUsers((previous) => [
                data.user,
                ...previous
            ]);

            setForm({
                first_name: "",
                last_name: "",
                email: "",
                password: ""
            });

            setShowCreateForm(false);
            setCreateSuccess(
                "L'administrateur a été créé avec succès."
            );

        } catch (err) {
            setCreateError(
                err.message ||
                "Une erreur est survenue pendant la création."
            );
        } finally {
            setCreating(false);
        }
    }

    function startEditingUser(user) {
        setEditingUser(user);

        setEditForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || ""
        });

        setEditError("");
        setEditSuccess("");
        setCreateSuccess("");
    }

    async function handleUpdateUser(e) {
        e.preventDefault();

        if (!editingUser) {
            return;
        }

        setEditError("");
        setEditSuccess("");
        setSavingEdit(true);

        try {
            const token = localStorage.getItem(
                "techtradisport_platform_token"
            );

            if (!token) {
                throw new Error(
                    "Session administrateur absente. Veuillez vous reconnecter."
                );
            }

            const response = await fetch(
                `${API_URL}/platform/users/${editingUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(editForm)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de modifier l'administrateur."
                );
            }

            setUsers((previous) =>
                previous.map((user) =>
                    String(user.id) === String(data.user.id)
                        ? data.user
                        : user
                )
            );

            setEditingUser(null);

            setEditForm({
                first_name: "",
                last_name: "",
                email: ""
            });

            setEditSuccess(
                "Les informations de l'administrateur ont été modifiées."
            );

        } catch (err) {
            setEditError(
                err.message ||
                "Une erreur est survenue pendant la modification."
            );
        } finally {
            setSavingEdit(false);
        }
    }

    async function handleToggleStatus(user) {
        const nextActive = user.active !== true;

        const fullName = [
            user.first_name,
            user.last_name
        ].filter(Boolean).join(" ") || user.email;

        const action = nextActive ? "réactiver" : "désactiver";

        const confirmed = window.confirm(
            `Voulez-vous ${action} le compte administrateur de ${fullName} ?`
        );

        if (!confirmed) {
            return;
        }

        setStatusError("");
        setStatusSuccess("");
        setUpdatingStatusId(user.id);

        try {
            const token = localStorage.getItem(
                "techtradisport_platform_token"
            );

            if (!token) {
                throw new Error(
                    "Session administrateur absente. Veuillez vous reconnecter."
                );
            }

            const response = await fetch(
                `${API_URL}/platform/users/${user.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        active: nextActive
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de modifier le statut du compte."
                );
            }

            setUsers((previous) =>
                previous.map((current) =>
                    String(current.id) === String(data.user.id)
                        ? data.user
                        : current
                )
            );

            setStatusSuccess(
                data.message ||
                "Le statut du compte a été modifié."
            );

        } catch (err) {
            setStatusError(
                err.message ||
                "Une erreur est survenue pendant le changement de statut."
            );
        } finally {
            setUpdatingStatusId(null);
        }
    }

    
    async function handleDeleteUser(user) {
        const fullName = [
            user.first_name,
            user.last_name
        ].filter(Boolean).join(" ") || user.email;

        const confirmed = window.confirm(
            `ATTENTION : voulez-vous supprimer définitivement le compte de ${fullName} (${user.email}) ? Cette action est irréversible.`
        );

        if (!confirmed) {
            return;
        }

        setDeleteError("");
        setDeleteSuccess("");
        setDeletingUserId(user.id);

        try {
            const token = localStorage.getItem(
                "techtradisport_platform_token"
            );

            if (!token) {
                throw new Error(
                    "Session administrateur absente. Veuillez vous reconnecter."
                );
            }

            const response = await fetch(
                `${API_URL}/platform/users/${user.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de supprimer cet administrateur."
                );
            }

            setUsers((previous) =>
                previous.filter(
                    (current) =>
                        String(current.id) !== String(user.id)
                )
            );

            setDeleteSuccess(
                data.message ||
                "Administrateur supprimé avec succès."
            );

        } catch (err) {
            setDeleteError(
                err.message ||
                "Une erreur est survenue pendant la suppression."
            );
        } finally {
            setDeletingUserId(null);
        }
    }


    useEffect(() => {
        let mounted = true;

        async function loadUsers() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem(
                    "techtradisport_platform_token"
                );

                if (!token) {
                    throw new Error(
                        "Session administrateur absente. Veuillez vous reconnecter."
                    );
                }

                const response = await fetch(
                    `${API_URL}/platform/users`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Impossible de charger les administrateurs."
                    );
                }

                if (mounted) {
                    setUsers(
                        Array.isArray(data.users)
                            ? data.users
                            : []
                    );
                }
            } catch (err) {
                if (mounted) {
                    setError(
                        err.message ||
                        "Une erreur est survenue."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            mounted = false;
        };
    }, []);

    const activeCount = users.filter(
        (user) => user.active === true
    ).length;

    const inactiveCount = users.length - activeCount;

    return (
        <div className="platform-agencies">
            <PlatformSidebar />

            <div className="platform-agencies-main">
                <PlatformHeader />

                <main className="platform-agencies-content">
                    <section className="platform-agencies-heading">
                        <div>
                            <p className="platform-agencies-eyebrow">
                                Administration plateforme
                            </p>

                            <h2>Utilisateurs</h2>

                            <p className="platform-agencies-subtitle">
                                Gérez les comptes administrateurs de
                                la plateforme TECHTRADISPORT.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="platform-users-create-button"
                            onClick={() => {
                                setShowCreateForm((previous) => !previous);
                                setCreateError("");
                                setCreateSuccess("");
                            }}
                        >
                            {showCreateForm
                                ? "Annuler"
                                : "+ Créer un administrateur"}
                        </button>
                    </section>

                    <section className="platform-agencies-stats">
                        <div className="platform-agencies-stat-card">
                            <div>
                                <p>Total des administrateurs</p>
                                <h3>{users.length}</h3>
                            </div>
                        </div>

                        <div className="platform-agencies-stat-card">
                            <div>
                                <p>Comptes actifs</p>
                                <h3>{activeCount}</h3>
                            </div>
                        </div>

                        <div className="platform-agencies-stat-card">
                            <div>
                                <p>Comptes inactifs</p>
                                <h3>{inactiveCount}</h3>
                            </div>
                        </div>
                    </section>
                    
                    {createSuccess && (
                        <div className="platform-users-success" role="status">
                            {createSuccess}
                        </div>
                    )}

                    {showCreateForm && (
                        <section className="platform-users-create-panel">
                            <div className="platform-users-create-heading">
                                <h3>Créer un administrateur</h3>
                                <p>
                                    Le compte sera créé avec le rôle
                                    PLATFORM_ADMIN.
                                </p>
                            </div>

                            {createError && (
                                <div className="platform-users-error" role="alert">
                                    {createError}
                                </div>
                            )}

                            <form
                                className="platform-users-create-form"
                                onSubmit={handleCreateUser}
                            >
                                <div className="platform-users-form-field">
                                    <label htmlFor="platform-user-first-name">
                                        Prénom
                                    </label>
                                    <input
                                        id="platform-user-first-name"
                                        name="first_name"
                                        type="text"
                                        autoComplete="given-name"
                                        maxLength={100}
                                        value={form.first_name}
                                        onChange={(e) =>
                                            setForm((previous) => ({
                                                ...previous,
                                                first_name: e.target.value
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="platform-users-form-field">
                                    <label htmlFor="platform-user-last-name">
                                        Nom
                                    </label>
                                    <input
                                        id="platform-user-last-name"
                                        name="last_name"
                                        type="text"
                                        autoComplete="family-name"
                                        maxLength={100}
                                        value={form.last_name}
                                        onChange={(e) =>
                                            setForm((previous) => ({
                                                ...previous,
                                                last_name: e.target.value
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="platform-users-form-field">
                                    <label htmlFor="platform-user-email">
                                        Adresse e-mail
                                    </label>
                                    <input
                                        id="platform-user-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        maxLength={255}
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((previous) => ({
                                                ...previous,
                                                email: e.target.value
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="platform-users-form-field">
                                    <label htmlFor="platform-user-password">
                                        Mot de passe initial
                                    </label>
                                    <input
                                        id="platform-user-password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm((previous) => ({
                                                ...previous,
                                                password: e.target.value
                                            }))
                                        }
                                        required
                                    />
                                    <small>
                                        Au moins 8 caractères.
                                    </small>
                                </div>

                                <div className="platform-users-form-actions">
                                    <button
                                        type="button"
                                        className="platform-users-cancel-button"
                                        disabled={creating}
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setCreateError("");
                                        }}
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        className="platform-users-submit-button"
                                        disabled={creating}
                                    >
                                        {creating
                                            ? "Création en cours…"
                                            : "Créer le compte"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}


                    <section className="platform-users-panel">
                        <div className="platform-users-panel-heading">
                            <div>
                                <h3>Administrateurs de la plateforme</h3>
                                <p>
                                    Comptes disposant du rôle
                                    PLATFORM_ADMIN.
                                </p>
                            </div>
                        </div>

                        {statusSuccess && (
                            <div
                                className="platform-users-success"
                                role="status"
                            >
                                {statusSuccess}
                            </div>
                        )}

                        {statusError && (
                            <div
                                className="platform-users-error"
                                role="alert"
                            >
                                {statusError}
                            </div>
                        )}

                        {deleteSuccess && (
                            <div
                                className="platform-users-success"
                                role="status"
                            >
                                {deleteSuccess}
                            </div>
                        )}

                        {deleteError && (
                            <div
                                className="platform-users-error"
                                role="alert"
                            >
                                {deleteError}
                            </div>
                        )}
                        
                        {editSuccess && (
                            <div
                                className="platform-users-success"
                                role="status"
                            >
                                {editSuccess}
                            </div>
                        )}

                        {editingUser && (
                            <section className="platform-users-create-panel">
                                <div className="platform-users-create-heading">
                                    <h3>Modifier un administrateur</h3>
                                    <p>
                                        Modifiez les informations de ce compte.
                                        Son rôle restera PLATFORM_ADMIN.
                                    </p>
                                </div>

                                {editError && (
                                    <div
                                        className="platform-users-error"
                                        role="alert"
                                    >
                                        {editError}
                                    </div>
                                )}

                                <form
                                    className="platform-users-create-form"
                                    onSubmit={handleUpdateUser}
                                >
                                    <div className="platform-users-form-field">
                                        <label htmlFor="edit-platform-first-name">
                                            Prénom
                                        </label>
                                        <input
                                            id="edit-platform-first-name"
                                            type="text"
                                            autoComplete="given-name"
                                            maxLength={100}
                                            value={editForm.first_name}
                                            onChange={(e) =>
                                                setEditForm((previous) => ({
                                                    ...previous,
                                                    first_name: e.target.value
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="platform-users-form-field">
                                        <label htmlFor="edit-platform-last-name">
                                            Nom
                                        </label>
                                        <input
                                            id="edit-platform-last-name"
                                            type="text"
                                            autoComplete="family-name"
                                            maxLength={100}
                                            value={editForm.last_name}
                                            onChange={(e) =>
                                                setEditForm((previous) => ({
                                                    ...previous,
                                                    last_name: e.target.value
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="platform-users-form-field">
                                        <label htmlFor="edit-platform-email">
                                            Adresse e-mail
                                        </label>
                                        <input
                                            id="edit-platform-email"
                                            type="email"
                                            autoComplete="email"
                                            maxLength={255}
                                            value={editForm.email}
                                            onChange={(e) =>
                                                setEditForm((previous) => ({
                                                    ...previous,
                                                    email: e.target.value
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="platform-users-form-actions">
                                        <button
                                            type="button"
                                            className="platform-users-cancel-button"
                                            disabled={savingEdit}
                                            onClick={() => {
                                                setEditingUser(null);
                                                setEditError("");
                                            }}
                                        >
                                            Annuler
                                        </button>

                                        <button
                                            type="submit"
                                            className="platform-users-submit-button"
                                            disabled={savingEdit}
                                        >
                                            {savingEdit
                                                ? "Enregistrement…"
                                                : "Enregistrer les modifications"}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}


                        {loading && (
                            <p role="status">
                                Chargement des administrateurs…
                            </p>
                        )}

                        {!loading && error && (
                            <div role="alert">
                                <p>{error}</p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        window.location.reload()
                                    }
                                >
                                    Réessayer
                                </button>
                            </div>
                        )}

                        {!loading && !error && users.length === 0 && (
                            <p>
                                Aucun administrateur de plateforme
                                n'a été trouvé.
                            </p>
                        )}

                        {!loading && !error && users.length > 0 && (
                            <div className="platform-users-table-wrapper">
                                <table className="platform-users-table">
                                    <thead>
                                        <tr>
                                            <th>Administrateur</th>
                                            <th>Adresse e-mail</th>
                                            <th>Rôle</th>
                                            <th>Statut</th>
                                            <th>Date de création</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <strong>
                                                        {[
                                                            user.first_name,
                                                            user.last_name,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ") ||
                                                            "Nom non renseigné"}
                                                    </strong>
                                                </td>

                                                <td>{user.email}</td>

                                                <td>
                                                    <span className="platform-users-role">
                                                        PLATFORM_ADMIN
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            user.active
                                                                ? "platform-users-status is-active"
                                                                : "platform-users-status is-inactive"
                                                        }
                                                    >
                                                        {user.active
                                                            ? "Actif"
                                                            : "Inactif"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        user.created_at
                                                    )}
                                                </td>

                                                <td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="platform-users-submit-button"
                                                            disabled={
                                                                savingEdit ||
                                                                updatingStatusId !== null ||
                                                                deletingUserId !== null
                                                            }
                                                            onClick={() => startEditingUser(user)}
                                                        >
                                                            Modifier
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`platform-users-toggle-button ${
                                                                user.active ? "is-deactivate" : "is-activate"
                                                            }`}
                                                            disabled={
                                                                updatingStatusId !== null ||
                                                                deletingUserId !== null
                                                            }
                                                            onClick={() => handleToggleStatus(user)}
                                                        >
                                                            {updatingStatusId === user.id
                                                                ? "Mise à jour…"
                                                                : user.active
                                                                    ? "Désactiver"
                                                                    : "Réactiver"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="platform-users-delete-button"
                                                            disabled={
                                                                deletingUserId !== null ||
                                                                updatingStatusId !== null
                                                            }
                                                            onClick={() => handleDeleteUser(user)}
                                                        >
                                                            {deletingUserId === user.id
                                                                ? "Suppression…"
                                                                : "Supprimer"}
                                                        </button>
                                                    </td>
                                                </td>
                                            </tr>
                                            
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
