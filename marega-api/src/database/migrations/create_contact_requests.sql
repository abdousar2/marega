CREATE TABLE IF NOT EXISTS marega.contact_requests (

    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    phone VARCHAR(50) NOT NULL,

    email VARCHAR(255) NOT NULL,

    company VARCHAR(200) NOT NULL,

    buildings VARCHAR(50),

    tenants VARCHAR(50),

    message TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'new',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);