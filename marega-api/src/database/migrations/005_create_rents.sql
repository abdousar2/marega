CREATE TABLE IF NOT EXISTS marega.rents (

    id SERIAL PRIMARY KEY,

    lease_id INTEGER NOT NULL
        REFERENCES marega.leases(id)
        ON DELETE CASCADE,

    tenant_id INTEGER NOT NULL
        REFERENCES marega.tenants(id),

    due_month DATE NOT NULL,

    due_date DATE NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    status VARCHAR(30)
        DEFAULT 'En attente',

    payment_id INTEGER
        REFERENCES marega.payments(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);