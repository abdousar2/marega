-- =====================================================
-- 015_add_users_audit_agency_isolation.sql
-- Isolation utilisateurs + journal d'audit par agence
-- TECHTRADISPORT / MAREGA
-- =====================================================

BEGIN;


-- =====================================================
-- 1. AUDIT LOGS : AJOUT DE agency_id
-- =====================================================

ALTER TABLE marega.audit_logs
ADD COLUMN IF NOT EXISTS agency_id INTEGER;


-- =====================================================
-- 2. RATTACHER LES ANCIENS LOGS À UNE AGENCE
-- =====================================================
-- Pour les anciens journaux créés par un utilisateur
-- appartenant à une agence.
--
-- On prend une seule agence lorsqu'un utilisateur
-- possède plusieurs rattachements.

UPDATE marega.audit_logs al
SET agency_id = au.agency_id
FROM (
    SELECT
        user_id,
        MIN(agency_id) AS agency_id
    FROM marega.agency_users
    GROUP BY user_id
) au
WHERE
    al.user_id = au.user_id
    AND al.agency_id IS NULL;


-- =====================================================
-- 3. CLÉ ÉTRANGÈRE
-- =====================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE
            conname =
                'fk_audit_logs_agency'
    ) THEN

        ALTER TABLE marega.audit_logs

        ADD CONSTRAINT fk_audit_logs_agency

        FOREIGN KEY (agency_id)

        REFERENCES marega.agencies(id)

        ON DELETE SET NULL;

    END IF;

END
$$;


-- =====================================================
-- 4. INDEX
-- =====================================================

CREATE INDEX IF NOT EXISTS
idx_audit_logs_agency

ON marega.audit_logs(agency_id);


-- =====================================================
-- FIN
-- =====================================================

COMMIT;