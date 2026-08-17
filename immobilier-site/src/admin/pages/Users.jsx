import { useEffect, useState } from "react";

import Layout from "../Layout";

import {
    PageHeader,
    Card,
    Button,
    Badge,
    Modal,
    Empty
} from "../../components/ui";

import UsersService from "../../services/users.service";


const ROLES = [
    "RESPONSABLE",
    "COMPTABLE",
    "AGENT"
];


export default function Users() {

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState(null);

    const [form, setForm] = useState({

        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "AGENT",
        active: true

    });


    // =========================================================
    // CHARGEMENT
    // =========================================================

    async function loadUsers() {

        try {

            setLoading(true);
            setError("");

            const data =
                await UsersService.getAll();

            setUsers(data);

        }

        catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Impossible de charger les utilisateurs."
            );

        }

        finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadUsers();

    }, []);


    // =========================================================
    // FORMULAIRE
    // =========================================================

    function resetForm() {

        setForm({

            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role: "AGENT",
            active: true

        });

        setEditingUser(null);

    }


    function openCreateModal() {

        resetForm();

        setShowModal(true);

    }


    function openEditModal(user) {

        setEditingUser(user);

        setForm({

            first_name:
                user.first_name || "",

            last_name:
                user.last_name || "",

            email:
                user.email || "",

            password: "",

            role:
                user.role || "AGENT",

            active:
                user.active

        });

        setShowModal(true);

    }


    function closeModal() {

        setShowModal(false);

        resetForm();

    }


    function handleChange(e) {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setForm(prev => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    }


    // =========================================================
    // CRÉATION / MODIFICATION
    // =========================================================

    async function handleSubmit(e) {

        e.preventDefault();

        try {

            if (!form.first_name.trim()) {

                alert("Le prénom est obligatoire.");

                return;

            }

            if (!form.last_name.trim()) {

                alert("Le nom est obligatoire.");

                return;

            }

            if (!form.email.trim()) {

                alert("L'email est obligatoire.");

                return;

            }


            if (!editingUser && !form.password) {

                alert(
                    "Le mot de passe est obligatoire pour créer un utilisateur."
                );

                return;

            }


            if (editingUser) {

                await UsersService.update(
                    editingUser.id,
                    {
                        first_name:
                            form.first_name,

                        last_name:
                            form.last_name,

                        email:
                            form.email,

                        role:
                            form.role,

                        active:
                            form.active
                    }
                );


                if (form.password) {

                    await UsersService.updatePassword(
                        editingUser.id,
                        form.password
                    );

                }

            }

            else {

                await UsersService.create({

                    first_name:
                        form.first_name,

                    last_name:
                        form.last_name,

                    email:
                        form.email,

                    password:
                        form.password,

                    role:
                        form.role,

                    active:
                        form.active

                });

            }


            await loadUsers();

            closeModal();

        }

        catch (err) {

            console.error(err);

            alert(
                err.message ||
                "Impossible d'enregistrer l'utilisateur."
            );

        }

    }


    // =========================================================
    // ACTIVATION / DÉSACTIVATION
    // =========================================================

    async function toggleActive(user) {

        const action =
            user.active
                ? "désactiver"
                : "activer";

        const confirmed =
            window.confirm(
                `Voulez-vous ${action} le compte de ${user.first_name} ${user.last_name} ?`
            );

        if (!confirmed) {

            return;

        }


        try {

            await UsersService.updateActive(
                user.id,
                !user.active
            );

            await loadUsers();

        }

        catch (err) {

            console.error(err);

            alert(
                err.message ||
                "Impossible de modifier le statut."
            );

        }

    }


    // =========================================================
    // SUPPRESSION
    // =========================================================

    async function handleDelete(user) {

        const confirmed =
            window.confirm(
                `Voulez-vous vraiment supprimer le compte de ${user.first_name} ${user.last_name} ?`
            );

        if (!confirmed) {

            return;

        }


        try {

            await UsersService.remove(
                user.id
            );

            await loadUsers();

        }

        catch (err) {

            console.error(err);

            alert(
                err.message ||
                "Impossible de supprimer l'utilisateur."
            );

        }

    }


    // =========================================================
    // AFFICHAGE
    // =========================================================

    if (loading) {

        return (

            <Layout>

                <div className="
                    min-h-[400px]
                    flex
                    items-center
                    justify-center
                ">

                    <p className="text-slate-500">
                        Chargement des utilisateurs...
                    </p>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <PageHeader

                title="Gestion des utilisateurs"

                subtitle="
                    Gérez les comptes et les niveaux d'accès
                    de l'application MAREGA.
                "

                buttonLabel="+ Nouvel utilisateur"

                onButtonClick={
                    openCreateModal
                }

            />
            <br></br>


            {error && (

                <div className="
                    mt-6
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    text-red-700
                    p-4
                ">

                    {error}

                </div>

            )}


            <div className="mt-8">

                <Card>

                    <div className="
                        flex
                        items-center
                        justify-between
                        mb-6
                    ">

                        <div>

                            <h2 className="
                                text-xl
                                font-bold
                                text-slate-800
                            ">

                                Utilisateurs

                            </h2>

                            <p className="
                                text-sm
                                text-slate-500
                                mt-1
                            ">

                                {users.length} compte
                                {users.length > 1
                                    ? "s"
                                    : ""
                                }

                            </p>

                        </div>

                    </div>


                    {users.length === 0 ? (

                        <Empty

                            title="Aucun utilisateur"

                            subtitle="
                                Aucun compte utilisateur
                                n'est enregistré.
                            "

                        />

                    ) : (

                        <div className="
                            overflow-x-auto
                        ">

                            <table className="
                                w-full
                                text-left
                            ">

                                <thead>

                                    <tr className="
                                        border-b
                                        border-slate-200
                                    ">

                                        <th className="
                                            px-4
                                            py-4
                                            text-sm
                                            text-slate-500
                                        ">
                                            Utilisateur
                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-sm
                                            text-slate-500
                                        ">
                                            Email
                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-sm
                                            text-slate-500
                                        ">
                                            Rôle
                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-sm
                                            text-slate-500
                                        ">
                                            Statut
                                        </th>

                                        <th className="
                                            px-4
                                            py-4
                                            text-sm
                                            text-slate-500
                                            text-right
                                        ">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map(user => (

                                        <tr
                                            key={user.id}
                                            className="
                                                border-b
                                                border-slate-100
                                                hover:bg-slate-50
                                            "
                                        >

                                            <td className="
                                                px-4
                                                py-5
                                            ">

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                ">

                                                    <div className="
                                                        w-10
                                                        h-10
                                                        rounded-full
                                                        bg-blue-100
                                                        text-blue-700
                                                        flex
                                                        items-center
                                                        justify-center
                                                        font-bold
                                                    ">

                                                        {(
                                                            user.first_name?.[0] ||
                                                            ""
                                                        ).toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <p className="
                                                            font-semibold
                                                            text-slate-800
                                                        ">

                                                            {user.first_name}{" "}
                                                            {user.last_name}

                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-slate-400
                                                            mt-1
                                                        ">

                                                            ID #{user.id}

                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            <td className="
                                                px-4
                                                py-5
                                                text-slate-600
                                            ">

                                                {user.email}

                                            </td>


                                            <td className="
                                                px-4
                                                py-5
                                            ">

                                                <Badge
                                                    color={
                                                        user.role === "ADMIN"
                                                            ? "purple"
                                                            : user.role === "RESPONSABLE"
                                                            ? "blue"
                                                            : user.role === "COMPTABLE"
                                                            ? "green"
                                                            : "orange"
                                                    }
                                                >

                                                    {user.role}

                                                </Badge>

                                            </td>


                                            <td className="
                                                px-4
                                                py-5
                                            ">

                                                <Badge
                                                    color={
                                                        user.active
                                                            ? "green"
                                                            : "red"
                                                    }
                                                >

                                                    {user.active
                                                        ? "Actif"
                                                        : "Désactivé"
                                                    }

                                                </Badge>

                                            </td>


                                            <td className="
                                                px-4
                                                py-5
                                            ">

                                                <div className="
                                                    flex
                                                    justify-end
                                                    gap-2
                                                    flex-wrap
                                                ">

                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            openEditModal(user)
                                                        }
                                                    >
                                                        Modifier
                                                    </Button>


                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            toggleActive(user)
                                                        }
                                                    >

                                                        {user.active
                                                            ? "Désactiver"
                                                            : "Activer"
                                                        }

                                                    </Button>


                                                    {user.role !== "ADMIN" && (

                                                        <Button
                                                            type="button"
                                                            variant="danger"
                                                            onClick={() =>
                                                                handleDelete(user)
                                                            }
                                                        >
                                                            Supprimer
                                                        </Button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </Card>

            </div>


            {/* =====================================================
                MODALE
            ===================================================== */}

            <Modal

                open={showModal}

                title={
                    editingUser
                        ? "Modifier l'utilisateur"
                        : "Nouvel utilisateur"
                }

                onClose={closeModal}

            >

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                    ">

                        <div>

                            <label className="
                                block
                                text-sm
                                font-medium
                                text-slate-700
                                mb-2
                            ">
                                Prénom
                            </label>

                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                className="
                                    border
                                    p-3
                                    rounded-xl
                                    w-full
                                "
                                required
                            />

                        </div>


                        <div>

                            <label className="
                                block
                                text-sm
                                font-medium
                                text-slate-700
                                mb-2
                            ">
                                Nom
                            </label>

                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                className="
                                    border
                                    p-3
                                    rounded-xl
                                    w-full
                                "
                                required
                            />

                        </div>

                    </div>


                    <div>

                        <label className="
                            block
                            text-sm
                            font-medium
                            text-slate-700
                            mb-2
                        ">
                            Adresse email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                rounded-xl
                                w-full
                            "
                            required
                        />

                    </div>


                    <div>

                        <label className="
                            block
                            text-sm
                            font-medium
                            text-slate-700
                            mb-2
                        ">
                            Rôle
                        </label>

                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                rounded-xl
                                w-full
                            "
                        >

                            {ROLES.map(role => (

                                <option
                                    key={role}
                                    value={role}
                                >

                                    {role}

                                </option>

                            ))}

                        </select>

                    </div>


                    <div>

                        <label className="
                            block
                            text-sm
                            font-medium
                            text-slate-700
                            mb-2
                        ">

                            {editingUser
                                ? "Nouveau mot de passe (optionnel)"
                                : "Mot de passe"
                            }

                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder={
                                editingUser
                                    ? "Laisser vide pour conserver l'actuel"
                                    : ""
                            }
                            className="
                                border
                                p-3
                                rounded-xl
                                w-full
                            "
                            required={!editingUser}
                        />

                    </div>


                    <label className="
                        flex
                        items-center
                        gap-3
                        cursor-pointer
                    ">

                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            className="
                                w-5
                                h-5
                            "
                        />

                        <span className="
                            text-sm
                            text-slate-700
                        ">

                            Compte actif

                        </span>

                    </label>


                    <div className="
                        flex
                        justify-end
                        gap-3
                        pt-4
                    ">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                        >
                            Annuler
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                        >

                            {editingUser
                                ? "Enregistrer les modifications"
                                : "Créer l'utilisateur"
                            }

                        </Button>

                    </div>

                </form>

            </Modal>

        </Layout>

    );

}