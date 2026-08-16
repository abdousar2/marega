CREATE TABLE IF NOT EXISTS marega.audit_logs (

    id SERIAL PRIMARY KEY,

    user_id INTEGER,

    action VARCHAR(50) NOT NULL,

    module VARCHAR(50) NOT NULL,

    entity_id INTEGER,

    details JSONB,

    ip_address VARCHAR(100),

    user_agent TEXT,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT audit_logs_user_fk
        FOREIGN KEY (user_id)
        REFERENCES marega.users(id)
        ON DELETE SET NULL

);