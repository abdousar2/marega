BEGIN;

CREATE TABLE IF NOT EXISTS marega.agency_settings (

    id SERIAL PRIMARY KEY,

    agency_id INTEGER NOT NULL UNIQUE,

    currency VARCHAR(10) NOT NULL DEFAULT 'XOF',

    locale VARCHAR(10) NOT NULL DEFAULT 'fr-SN',

    timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Dakar',

    date_format VARCHAR(32) NOT NULL DEFAULT 'DD/MM/YYYY',

    receipt_prefix VARCHAR(20) NOT NULL DEFAULT 'REC',

    contract_prefix VARCHAR(20) NOT NULL DEFAULT 'BAIL',

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_agency_settings_agency
        FOREIGN KEY (agency_id)
        REFERENCES marega.agencies(id)
        ON DELETE CASCADE

);

CREATE INDEX IF NOT EXISTS idx_agency_settings_agency
ON marega.agency_settings(agency_id);

COMMIT;