CREATE TABLE IF NOT EXISTS marega.apartments (

    id SERIAL PRIMARY KEY,

    building_id INTEGER NOT NULL,

    number VARCHAR(30) NOT NULL,

    floor VARCHAR(30),

    type VARCHAR(30),

    surface NUMERIC(8,2),

    rent NUMERIC(12,2),

    charges NUMERIC(12,2),

    deposit NUMERIC(12,2),

    status VARCHAR(30) DEFAULT 'Libre',

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_building
        FOREIGN KEY(building_id)
        REFERENCES marega.buildings(id)
        ON DELETE CASCADE

);