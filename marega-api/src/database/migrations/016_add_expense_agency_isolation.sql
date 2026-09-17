-- =====================================================
-- 016_add_expense_agency_isolation.sql
-- Isolation des dépenses par agence
-- MAREGA
-- =====================================================

BEGIN;

-- =====================================================
-- 1. AJOUT DE agency_id
-- =====================================================

ALTER TABLE marega.expenses
ADD COLUMN IF NOT EXISTS agency_id INTEGER;


-- =====================================================
-- 2. CONTRAINTE AGENCE
-- =====================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_expenses_agency'
    ) THEN

        ALTER TABLE marega.expenses
        ADD CONSTRAINT fk_expenses_agency
        FOREIGN KEY (agency_id)
        REFERENCES marega.agencies(id)
        ON DELETE CASCADE;

    END IF;

END
$$;


-- =====================================================
-- 3. AGENCE OBLIGATOIRE
-- =====================================================

ALTER TABLE marega.expenses
ALTER COLUMN agency_id SET NOT NULL;


-- =====================================================
-- 4. INDEX
-- =====================================================

CREATE INDEX IF NOT EXISTS
idx_expenses_agency
ON marega.expenses(agency_id);


COMMIT;