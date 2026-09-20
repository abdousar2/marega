ALTER TABLE marega.leases
ALTER COLUMN contract_number SET NOT NULL;

ALTER TABLE marega.leases
ALTER COLUMN end_date SET NOT NULL;

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'marega.leases'::regclass
          AND conname = 'leases_agency_contract_number_unique'
    ) THEN

        ALTER TABLE marega.leases
        ADD CONSTRAINT leases_agency_contract_number_unique
        UNIQUE (
            agency_id,
            contract_number
        );

    END IF;

END
$$;
