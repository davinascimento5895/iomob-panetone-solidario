
-- This migration must be run outside of a transaction if using ALTER TYPE ADD VALUE
-- In Supabase dashboard, you can run this in the SQL Editor.
-- NOTE: If running as a migration file, some environments might fail if they wrap migrations in transactions.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'staff') THEN
        ALTER TYPE public.app_role ADD VALUE 'staff';
    END IF;
END $$;
