export const ROLES = {
    ADMIN: "ADMIN",
    RESPONSABLE: "RESPONSABLE",
    COMPTABLE: "COMPTABLE",
    AGENT: "AGENT"
};


export const PERMISSIONS = {

    ADMIN: {
        dashboard: true,

        buildings: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        apartments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        tenants: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        contracts: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        rents: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        payments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        expenses: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        finance: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        messages: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        users: {
            view: true,
            create: true,
            update: true,
            delete: true
        },

        audit: {
            view: true
        }
    },


    RESPONSABLE: {
        dashboard: true,

        buildings: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        apartments: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        tenants: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        contracts: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        rents: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        payments: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        expenses: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        finance: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        messages: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        users: {
            view: false,
            create: false,
            update: false,
            delete: false
        }
    },


    COMPTABLE: {
        dashboard: true,

        buildings: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        apartments: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        tenants: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        contracts: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        rents: {
            view: true,
            create: true,
            update: false,
            delete: false
        },

        payments: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        expenses: {
            view: true,
            create: true,
            update: true,
            delete: false
        },

        finance: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        messages: {
            view: false,
            create: false,
            update: false,
            delete: false
        },

        users: {
            view: false,
            create: false,
            update: false,
            delete: false
        }
    },


    AGENT: {
        dashboard: true,

        buildings: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        apartments: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        tenants: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        contracts: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        rents: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        payments: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        expenses: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        finance: {
            view: false,
            create: false,
            update: false,
            delete: false
        },

        messages: {
            view: true,
            create: false,
            update: false,
            delete: false
        },

        users: {
            view: false,
            create: false,
            update: false,
            delete: false
        }
    }

};


export function hasPermission(
    role,
    module,
    action = "view"
) {

    if (!role) {
        return false;
    }

    const rolePermissions =
        PERMISSIONS[role];

    if (!rolePermissions) {
        return false;
    }

    const modulePermissions =
        rolePermissions[module];

    if (!modulePermissions) {
        return false;
    }

    return !!modulePermissions[action];

}