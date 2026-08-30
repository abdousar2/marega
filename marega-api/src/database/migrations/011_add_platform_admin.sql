-- =========================================================
-- 011 - AJOUT DU ROLE PLATFORM_ADMIN
-- =========================================================

ALTER TABLE marega.users

DROP CONSTRAINT IF EXISTS users_role_check;


ALTER TABLE marega.users

ADD CONSTRAINT users_role_check

CHECK (
    role IN (
        'PLATFORM_ADMIN',
        'ADMIN',
        'RESPONSABLE',
        'COMPTABLE',
        'AGENT'
    )
);