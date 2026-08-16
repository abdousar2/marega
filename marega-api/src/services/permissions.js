export const ROLES = {
    ADMIN: "ADMIN",
    RESPONSABLE: "RESPONSABLE",
    COMPTABLE: "COMPTABLE",
    AGENT: "AGENT"
};

export const PERMISSIONS = {

    ADMIN: [
        "dashboard",
        "buildings",
        "apartments",
        "tenants",
        "contracts",
        "rents",
        "payments",
        "expenses",
        "messages",
        "users"
    ],

    RESPONSABLE: [
        "dashboard",
        "buildings",
        "apartments",
        "tenants",
        "contracts",
        "rents",
        "payments",
        "expenses",
        "messages"
    ],

    COMPTABLE: [
        "dashboard",
        "rents",
        "payments",
        "expenses"
    ],

    AGENT: [
        "dashboard",
        "buildings",
        "apartments",
        "tenants",
        "contracts",
        "rents"
    ]

};

export function hasPermission(
    role,
    permission
) {

    if (!role) {
        return false;
    }

    const permissions =
        PERMISSIONS[role] || [];

    return permissions.includes(
        permission
    );

}