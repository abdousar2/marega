DROP TABLE IF EXISTS marega.buildings CASCADE;

CREATE TABLE marega.buildings (

    id SERIAL PRIMARY KEY,

    code VARCHAR(20) UNIQUE NOT NULL,

    name VARCHAR(150) NOT NULL,

    address TEXT,

    city VARCHAR(100),

    country VARCHAR(100),

    floors INTEGER DEFAULT 1,

    apartments_count INTEGER DEFAULT 0,

    status VARCHAR(30) DEFAULT 'ACTIVE',

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);