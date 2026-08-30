-- =====================================================
-- 012_add_agency_isolation.sql
-- Isolation des données par agence
-- TECHTRADISPORT
-- =====================================================

BEGIN;

---------------------------------------------------------
-- BUILDINGS
---------------------------------------------------------

ALTER TABLE marega.buildings
ADD COLUMN IF NOT EXISTS agency_id INTEGER;

UPDATE marega.buildings
SET agency_id = 1
WHERE agency_id IS NULL;

ALTER TABLE marega.buildings
ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE marega.buildings
ADD CONSTRAINT fk_buildings_agency
FOREIGN KEY (agency_id)
REFERENCES marega.agencies(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_buildings_agency
ON marega.buildings(agency_id);

---------------------------------------------------------
-- APARTMENTS
---------------------------------------------------------

ALTER TABLE marega.apartments
ADD COLUMN IF NOT EXISTS agency_id INTEGER;

UPDATE marega.apartments a
SET agency_id = b.agency_id
FROM marega.buildings b
WHERE a.building_id = b.id
AND a.agency_id IS NULL;

ALTER TABLE marega.apartments
ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE marega.apartments
ADD CONSTRAINT fk_apartments_agency
FOREIGN KEY (agency_id)
REFERENCES marega.agencies(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_apartments_agency
ON marega.apartments(agency_id);

---------------------------------------------------------
-- TENANTS
---------------------------------------------------------

ALTER TABLE marega.tenants
ADD COLUMN IF NOT EXISTS agency_id INTEGER;

UPDATE marega.tenants t
SET agency_id = a.agency_id
FROM marega.apartments a
WHERE t.apartment_id = a.id
AND t.agency_id IS NULL;

ALTER TABLE marega.tenants
ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE marega.tenants
ADD CONSTRAINT fk_tenants_agency
FOREIGN KEY (agency_id)
REFERENCES marega.agencies(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tenants_agency
ON marega.tenants(agency_id);

---------------------------------------------------------
-- LEASES
---------------------------------------------------------

ALTER TABLE marega.leases
ADD COLUMN IF NOT EXISTS agency_id INTEGER;

UPDATE marega.leases l
SET agency_id = t.agency_id
FROM marega.tenants t
WHERE l.tenant_id = t.id
AND l.agency_id IS NULL;

ALTER TABLE marega.leases
ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE marega.leases
ADD CONSTRAINT fk_leases_agency
FOREIGN KEY (agency_id)
REFERENCES marega.agencies(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_leases_agency
ON marega.leases(agency_id);

---------------------------------------------------------
-- PAYMENTS
---------------------------------------------------------

ALTER TABLE marega.payments
ADD COLUMN IF NOT EXISTS agency_id INTEGER;

UPDATE marega.payments p
SET agency_id = l.agency_id
FROM marega.leases l
WHERE p.lease_id = l.id
AND p.agency_id IS NULL;

ALTER TABLE marega.payments
ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE marega.payments
ADD CONSTRAINT fk_payments_agency
FOREIGN KEY (agency_id)
REFERENCES marega.agencies(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_payments_agency
ON marega.payments(agency_id);

---------------------------------------------------------
-- RENTS
---------------------------------------------------------

ALTER TABLE marega.rents
ADD COLUMN IF NOT EXISTS agency_id INTEGER;

UPDATE marega.rents r
SET agency_id = l.agency_id
FROM marega.leases l
WHERE r.lease_id = l.id
AND r.agency_id IS NULL;

ALTER TABLE marega.rents
ALTER COLUMN agency_id SET NOT NULL;

ALTER TABLE marega.rents
ADD CONSTRAINT fk_rents_agency
FOREIGN KEY (agency_id)
REFERENCES marega.agencies(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_rents_agency
ON marega.rents(agency_id);

COMMIT;