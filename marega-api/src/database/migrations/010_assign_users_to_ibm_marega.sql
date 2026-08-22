INSERT INTO marega.agency_users
(
    agency_id,
    user_id,
    role,
    active
)

SELECT
    1,
    id,
    role,
    active

FROM marega.users

ON CONFLICT (agency_id, user_id)
DO NOTHING;