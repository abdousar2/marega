-- =========================================================
-- 014_update_document_template_types.sql
-- Autoriser les différents types de documents analysables
-- =========================================================

ALTER TABLE marega.document_templates
DROP CONSTRAINT IF EXISTS chk_document_templates_type;

ALTER TABLE marega.document_templates
ADD CONSTRAINT chk_document_templates_type
CHECK (
    document_type IN (
        'LEASE_CONTRACT',
        'RECEIPT',
        'NOTICE'
    )
);