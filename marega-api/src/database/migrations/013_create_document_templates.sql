-- =========================================================
-- MAREGA
-- Migration 013
-- Moteur de templates documentaires intelligents
-- =========================================================


-- =========================================================
-- 1. TEMPLATES DE DOCUMENTS
-- =========================================================
-- Un template peut être :
-- CONTRACT
-- RECEIPT
--
-- definition contient la structure visuelle / technique
-- du document sous forme JSONB.
-- =========================================================

CREATE TABLE IF NOT EXISTS marega.document_templates (

    id SERIAL PRIMARY KEY,

    agency_id INTEGER NOT NULL,

    document_type VARCHAR(30) NOT NULL,

    name VARCHAR(255) NOT NULL,

    version INTEGER NOT NULL DEFAULT 1,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    source_document_path TEXT,

    definition JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_document_templates_agency

        FOREIGN KEY (agency_id)

        REFERENCES marega.agencies(id)

        ON DELETE CASCADE,


    CONSTRAINT chk_document_templates_type

        CHECK (

            document_type IN (

                'CONTRACT',

                'RECEIPT'

            )

        ),


    CONSTRAINT chk_document_templates_status

        CHECK (

            status IN (

                'DRAFT',

                'ACTIVE',

                'ARCHIVED'

            )

        )

);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_document_templates_agency

    ON marega.document_templates(agency_id);


CREATE INDEX IF NOT EXISTS idx_document_templates_type

    ON marega.document_templates(
        agency_id,
        document_type
    );


CREATE INDEX IF NOT EXISTS idx_document_templates_status

    ON marega.document_templates(
        agency_id,
        status
    );


-- =========================================================
-- 2. CHAMPS DU TEMPLATE
-- =========================================================
-- Exemple :
--
-- TENANT_FULL_NAME
-- TENANT_IDENTITY_NUMBER
-- MONTHLY_RENT
-- DEPOSIT
-- PROPERTY_ADDRESS
-- LANDLORD_NAME
--
-- source indique où récupérer la donnée dans MAREGA.
-- =========================================================

CREATE TABLE IF NOT EXISTS marega.template_fields (

    id SERIAL PRIMARY KEY,

    template_id INTEGER NOT NULL,

    code VARCHAR(150) NOT NULL,

    label VARCHAR(255),

    data_type VARCHAR(50) NOT NULL,

    source VARCHAR(255),

    required BOOLEAN NOT NULL DEFAULT FALSE,

    default_value JSONB,

    confidence NUMERIC(5,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_template_fields_template

        FOREIGN KEY (template_id)

        REFERENCES marega.document_templates(id)

        ON DELETE CASCADE,


    CONSTRAINT uq_template_field

        UNIQUE (
            template_id,
            code
        )

);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_template_fields_template

    ON marega.template_fields(template_id);


CREATE INDEX IF NOT EXISTS idx_template_fields_source

    ON marega.template_fields(source);


-- =========================================================
-- 3. CLAUSES DU TEMPLATE
-- =========================================================
-- Exemple :
--
-- ARTICLE 1 - DESIGNATION
-- ARTICLE 2 - LOYER
-- ARTICLE 3 - GARANTIE
-- ARTICLE 6 - CLAUSE RESOLUTOIRE
--
-- variables contient éventuellement les variables
-- utilisées dans la clause.
-- =========================================================

CREATE TABLE IF NOT EXISTS marega.template_clauses (

    id SERIAL PRIMARY KEY,

    template_id INTEGER NOT NULL,

    code VARCHAR(150) NOT NULL,

    title VARCHAR(255),

    content TEXT NOT NULL,

    clause_order INTEGER NOT NULL DEFAULT 0,

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    variables JSONB NOT NULL DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_template_clauses_template

        FOREIGN KEY (template_id)

        REFERENCES marega.document_templates(id)

        ON DELETE CASCADE,


    CONSTRAINT uq_template_clause

        UNIQUE (
            template_id,
            code
        )

);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_template_clauses_template

    ON marega.template_clauses(template_id);


CREATE INDEX IF NOT EXISTS idx_template_clauses_order

    ON marega.template_clauses(
        template_id,
        clause_order
    );


-- =========================================================
-- 4. PARAMÈTRES PROPRES À UNE AGENCE
-- =========================================================
-- Exemple issu du contrat de Gérance Dramé :
--
-- initial_lease_duration
-- renewal_duration
-- notice_period
-- rent_revision_rate
--
-- Ces paramètres ne deviennent PAS des colonnes de leases.
-- =========================================================

CREATE TABLE IF NOT EXISTS marega.agency_terms (

    id SERIAL PRIMARY KEY,

    agency_id INTEGER NOT NULL,

    code VARCHAR(150) NOT NULL,

    label VARCHAR(255) NOT NULL,

    value_type VARCHAR(50) NOT NULL,

    default_value JSONB,

    description TEXT,

    source_template_id INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_agency_terms_agency

        FOREIGN KEY (agency_id)

        REFERENCES marega.agencies(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_agency_terms_template

        FOREIGN KEY (source_template_id)

        REFERENCES marega.document_templates(id)

        ON DELETE SET NULL,


    CONSTRAINT uq_agency_term

        UNIQUE (
            agency_id,
            code
        )

);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_agency_terms_agency

    ON marega.agency_terms(agency_id);


CREATE INDEX IF NOT EXISTS idx_agency_terms_template

    ON marega.agency_terms(source_template_id);


-- =========================================================
-- 5. VALEURS DES PARAMÈTRES POUR UN CONTRAT
-- =========================================================
-- Un même paramètre peut avoir une valeur différente
-- selon le contrat.
--
-- Exemple :
--
-- Agence :
-- rent_revision_rate = 1 %
--
-- Contrat A :
-- rent_revision_rate = 1 %
--
-- Contrat B :
-- rent_revision_rate = 2 %
-- =========================================================

CREATE TABLE IF NOT EXISTS marega.lease_terms (

    id SERIAL PRIMARY KEY,

    lease_id INTEGER NOT NULL,

    agency_term_id INTEGER NOT NULL,

    value JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_lease_terms_lease

        FOREIGN KEY (lease_id)

        REFERENCES marega.leases(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_lease_terms_agency_term

        FOREIGN KEY (agency_term_id)

        REFERENCES marega.agency_terms(id)

        ON DELETE CASCADE,


    CONSTRAINT uq_lease_term

        UNIQUE (
            lease_id,
            agency_term_id
        )

);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_lease_terms_lease

    ON marega.lease_terms(lease_id);


CREATE INDEX IF NOT EXISTS idx_lease_terms_agency_term

    ON marega.lease_terms(agency_term_id);


-- =========================================================
-- FIN MIGRATION 013
-- =========================================================