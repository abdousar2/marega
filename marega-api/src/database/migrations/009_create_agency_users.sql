CREATE TABLE IF NOT EXISTS marega.agency_users (

    id SERIAL PRIMARY KEY,

    agency_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'AGENT',

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT agency_users_agency_fk
        FOREIGN KEY (agency_id)
        REFERENCES marega.agencies(id)
        ON DELETE CASCADE,

    CONSTRAINT agency_users_user_fk
        FOREIGN KEY (user_id)
        REFERENCES marega.users(id)
        ON DELETE CASCADE,

    CONSTRAINT agency_users_role_check
        CHECK (
            role IN (
                'ADMIN',
                'RESPONSABLE',
                'COMPTABLE',
                'AGENT'
            )
        ),

    CONSTRAINT agency_users_unique
        UNIQUE (agency_id, user_id)

);