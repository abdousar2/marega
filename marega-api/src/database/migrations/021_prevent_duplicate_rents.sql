ALTER TABLE marega.rents
ADD CONSTRAINT rents_lease_due_month_unique
UNIQUE (
    lease_id,
    due_month
);
