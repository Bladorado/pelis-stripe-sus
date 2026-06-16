-- DROP TABLE IF EXISTS perfiles CASCADE;

-- CREATE TABLE perfiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email TEXT NOT NULL,
--   nombre TEXT,
--   plan TEXT NOT NULL DEFAULT 'cliente' 
--     CHECK (plan IN ('cliente', 'estandar', 'premium', 'admin')),
--   stripe_customer_id TEXT,
--   activo BOOLEAN NOT NULL DEFAULT true,
--   creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
--   actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- GRANT ALL ON perfiles TO anon, authenticated, service_role;

-- ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;

-- SELECT 
--   grantee,
--   privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_name = 'perfiles';

-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'perfiles';