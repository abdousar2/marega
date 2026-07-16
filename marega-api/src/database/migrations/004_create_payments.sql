CREATE TABLE IF NOT EXISTS marega.payments (

    id SERIAL PRIMARY KEY,

    tenant_id INTEGER NOT NULL
        REFERENCES marega.tenants(id)
        ON DELETE CASCADE,

    lease_id INTEGER
        REFERENCES marega.leases(id)
        ON DELETE SET NULL,

    payment_month DATE NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    payment_date DATE,

    payment_method VARCHAR(50),

    reference VARCHAR(100),

    status VARCHAR(20) NOT NULL DEFAULT 'En attente',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);