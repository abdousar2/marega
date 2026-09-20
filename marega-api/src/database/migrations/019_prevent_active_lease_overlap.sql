CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'marega.leases'::regclass
          AND conname = 'leases_no_active_overlap'
    ) THEN

        ALTER TABLE marega.leases

        ADD CONSTRAINT leases_no_active_overlap

        EXCLUDE USING gist
        (
            agency_id WITH =,

            apartment_id WITH =,

            daterange(
                start_date,
                end_date,
                '[]'
            ) WITH &&

        )

        WHERE (
            status = 'Actif'
        );

    END IF;

END
$$;
